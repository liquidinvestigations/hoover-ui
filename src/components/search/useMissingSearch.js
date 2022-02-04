import { useCallback, useEffect, useState } from 'react'
import { aggregationFields } from '../../constants/aggregationFields'
import { search as searchAPI } from '../../api'
import { ASYNC_SEARCH_POLL_INTERVAL } from '../../constants/general'
import { asyncSearch as asyncSearchAPI } from '../../backend/api'

export default function useMissingSearch(query) {
    const [missingAggregations, setMissingAggregations] = useState(null)
    const [missingTasks, setMissingTasks] = useState({})
    const [missingLoading, setMissingLoading] = useState(
        Object.entries(aggregationFields).reduce((acc, [field]) => {
            acc[field] = !!query.collections?.length
            return acc
        }, {})
    )
    const [missingTaskRequestCounter, setMissingTaskRequestCounter] = useState(
        Object.entries(aggregationFields).reduce((acc, [field]) => {
            acc[field] = 0
            return acc
        }, {})
    )
    const handleMissingError = field => {
        setMissingLoading(
            Object.entries(aggregationFields).reduce((acc, [field]) => {
                acc[field] = false
                return acc
            }, {})
        )
        setMissingAggregations(aggregations => ({...(aggregations || {}), [field]: undefined}))
        setMissingTasks(tasks => ({...(tasks || {}), [field]: undefined}))
    }

    useEffect(() => {
        setMissingAggregations(null)
        setMissingTasks({})
    }, [JSON.stringify({
        ...query,
        facets: null,
        page: null,
        size: null,
        order: null,
    })])

    const loadMissing = useCallback(async field => {
        if (query.collections?.length) {
            setMissingLoading(loading => ({ ...loading, [field]: true }))
            setMissingTasks(tasks => ({...(tasks || {}), [field]: undefined}))
            setMissingTaskRequestCounter(counters => ({ ...counters, [field]: 0 }))

            try {
                const taskData = await searchAPI({
                    ...query,
                    q: query.q || '*',
                    type: 'aggregations',
                    fieldList: [field],
                    missing: true,
                    async: true,
                })

                setMissingTasks(tasks => ({
                    ...(tasks || {}),
                    [field]: {
                        ...taskData,
                        initialEta: taskData?.eta.total_sec
                    }
                }))
            }
            catch(error) {
                handleMissingError(field)
            }
        } else {
            setMissingAggregations(null)
        }
    }, [query])

    useEffect(() => {
        let timeout

        setMissingTasks(prevTasksMissing => {
            Object.entries(prevTasksMissing).forEach(([field, taskData]) => {
                if (!taskData) {
                    return
                }

                const done = resultData => {
                    setMissingAggregations(aggregations => ({ ...(aggregations || {}), ...resultData.aggregations }))
                    setMissingLoading(loading => ({
                        ...loading,
                        [field]: false,
                    }))
                }

                if (taskData.status === 'done') {
                    done(taskData.result)
                } else if (!taskData.retrieving) {
                    taskData.retrieving = true

                    const wait = taskData.eta.total_sec < ASYNC_SEARCH_POLL_INTERVAL ? true : ''

                    if (wait) {
                        setMissingTaskRequestCounter(counter => ({
                            ...counter,
                            [field]: counter[field] + 1,
                        }))
                    }

                    asyncSearchAPI(taskData.task_id, wait)
                        .then(taskResultData => {
                            const update = () => setMissingTasks({
                                ...prevTasksMissing,
                                [field]: { ...taskResultData, retrieving: false }
                            })

                            if (taskResultData.status === 'done') {
                                done(taskResultData.result)
                            } else if (Date.now() - Date.parse(taskResultData.date_created) < (prevTasksMissing.initialEta * 2 + 60) * 1000) {
                                timeout = setTimeout(update, ASYNC_SEARCH_POLL_INTERVAL * 1000)
                            } else {
                                handleMissingError(field)
                            }
                        })
                        .catch(error => {
                            if (wait && error.name === 'TypeError') {
                                if (missingTaskRequestCounter[field] < 3) {
                                    setMissingTasks({
                                        ...prevTasksMissing,
                                        [field]: { ...prevTasksMissing[field], retrieving: false }
                                    })
                                } else {
                                    setMissingTasks({
                                        ...prevTasksMissing,
                                        [field]: undefined
                                    })
                                }
                            } else{
                                handleMissingError(field)
                            }
                        })
                }
            })
            return prevTasksMissing
        })

        return () => {
            clearTimeout(timeout)
        }
    }, [missingTasks])

    return {
        missingAggregations, setMissingAggregations, missingTasks, missingLoading, loadMissing,
    }
}
