import { useEffect, useRef, useState } from 'react'
import { search as searchAPI } from '../../api'
import { asyncSearch as asyncSearchAPI } from '../../backend/api'
import { aggregationFields } from '../../constants/aggregationFields'
import { ASYNC_SEARCH_POLL_INTERVAL } from '../../constants/general'

const maxAggregationsBatchSize = Math.ceil(Object.entries(aggregationFields).length / process.env.AGGREGATIONS_SPLIT)
const aggregationGroups = Object.entries(aggregationFields)
    .reduce((acc, [key]) => {
        if (acc?.[acc.length - 1]?.fieldList?.length < maxAggregationsBatchSize) {
            acc[acc.length - 1].fieldList.push(key)
        } else {
            acc.push({ fieldList: [key] })
        }
        return acc
    }, [])

export default function useAggregationsSearch(query, forcedRefresh, setCollectionsCount) {
    const prevForcedRefreshRef = useRef()
    const [aggregations, setAggregations] = useState()
    const [aggregationsError, setAggregationsError] = useState()
    const [aggregationsTasks, setAggregationsTasks] = useState({})
    const [aggregationsLoading, setAggregationsLoading] = useState(
        Object.entries(aggregationFields).reduce((acc, [field]) => {
            acc[field] = !!query.collections?.length
            return acc
        }, {})
    )
    const [aggregationsTaskRequestCounter, setAggregationsTaskRequestCounter] = useState(
        aggregationGroups.reduce((acc, { fieldList }) => {
            acc[fieldList.join()] = 0
            return acc
        }, {})
    )
    const handleAggregationsError = error => {
        if (error.name !== 'AbortError') {
            setAggregations(null)
            setAggregationsError(error.message)
            setAggregationsTasks({})
            setAggregationsLoading(
                Object.entries(aggregationFields).reduce((acc, [field]) => {
                    acc[field] = false
                    return acc
                }, {})
            )
            setAggregationsTaskRequestCounter(
                aggregationGroups.reduce((acc, { fieldList }) => {
                    acc[fieldList.join()] = 0
                    return acc
                }, {})
            )
        }
    }

    useEffect(() => {
        if (query.collections?.length) {
            setAggregationsError(null)
            setAggregationsTasks({})
            setAggregationsLoading(
                Object.entries(aggregationFields).reduce((acc, [field]) => {
                    acc[field] = true
                    return acc
                }, {})
            )
            setAggregationsTaskRequestCounter(
                aggregationGroups.reduce((acc, { fieldList }) => {
                    acc[fieldList.join()] = 0
                    return acc
                }, {})
            )

            aggregationGroups.map(async (aggregationGroup, i) => {
                try {
                    const taskData = await searchAPI({
                        ...query,
                        q: query.q || '*',
                        type: 'aggregations',
                        fieldList: aggregationGroup.fieldList,
                        refresh: prevForcedRefreshRef.current !== forcedRefresh,
                        async: true,
                    })

                    setAggregationsTasks(tasks => ({
                        ...tasks,
                        [aggregationGroup.fieldList.join()]: {
                            ...taskData,
                            initialEta: taskData?.eta.total_sec
                        },
                    }))

                } catch (error) {
                    handleAggregationsError(error)
                }
            })

        } else {
            setAggregations(null)
        }
        prevForcedRefreshRef.current = forcedRefresh
    }, [JSON.stringify({
        ...query,
        facets: null,
        page: null,
        size: null,
        order: null,
    }), forcedRefresh])

    useEffect(() => {
        let timeout

        setAggregationsTasks(prevTasksAggregations => {
            Object.entries(prevTasksAggregations).forEach(([fields, taskData]) => {
                const done = resultData => {
                    setAggregations(aggregations => ({ ...(aggregations || {}), ...resultData.aggregations }))
                    setCollectionsCount(resultData.count_by_index)
                    setAggregationsLoading(loading => ({
                        ...loading,
                        ...fields.split(',').reduce((acc, field) => {
                            acc[field] = false
                            return acc
                        }, {}),
                    }))
                }

                if (taskData.status === 'done') {
                    done(taskData.result)
                } else if (!taskData.retrieving) {
                    taskData.retrieving = true

                    const wait = taskData.eta.total_sec < ASYNC_SEARCH_POLL_INTERVAL ? true : ''

                    if (wait) {
                        setAggregationsTaskRequestCounter(counter => ({
                            ...counter,
                            [fields]: counter[fields] + 1,
                        }))
                    }

                    asyncSearchAPI(taskData.task_id, wait)
                        .then(taskResultData => {
                            const update = () => setAggregationsTasks({
                                ...prevTasksAggregations,
                                [fields]: { ...taskResultData, retrieving: false }
                            })

                            if (taskResultData.status === 'done') {
                                done(taskResultData.result)
                            } else if (Date.now() - Date.parse(taskResultData.date_created) < (prevTasksAggregations.initialEta * 2 + 60) * 1000) {
                                timeout = setTimeout(update, ASYNC_SEARCH_POLL_INTERVAL * 1000)
                            } else {
                                handleAggregationsError(new Error('Aggregations task ETA timeout'))
                            }
                        })
                        .catch(error => {
                            if (wait && error.name === 'TypeError') {
                                if (aggregationsTaskRequestCounter[fields] < 3) {
                                    setAggregationsTasks({
                                        ...prevTasksAggregations,
                                        [fields]: { ...prevTasksAggregations[fields], retrieving: false }
                                    })
                                } else {
                                    setAggregationsTasks({
                                        ...prevTasksAggregations,
                                        [fields]: undefined
                                    })
                                }
                            } else{
                                handleAggregationsError(error) //TODO fix for only one aggregation hits retry limit
                            }
                        })
                }
            })
            return prevTasksAggregations
        })

        return () => {
            clearTimeout(timeout)
        }
    }, [aggregationsTasks])

    const prevFacetsQueryRef = useRef()
    useEffect(() => {
        const { facets, page, size, order, ...queryRest } = query
        const { facets: prevFacets, page: prevPage, size: prevSize, order: prevOrder, ...prevQueryRest } = prevFacetsQueryRef.current || {}

        if (JSON.stringify(queryRest) === JSON.stringify(prevQueryRest) && JSON.stringify(facets) !== JSON.stringify(prevFacets)) {
            const loading = state => Object.entries({
                ...(facets || {}),
                ...(prevFacets || {}),
            }).reduce((acc, [field]) => {
                if (JSON.stringify(facets?.[field]) !== JSON.stringify(prevFacets?.[field])) {
                    acc[field] = state
                }
                return acc
            }, {})

            setAggregationsError(null)
            setAggregationsLoading(loading(true))

            searchAPI({
                ...query,
                q: query.q || '*',
                type: 'aggregations',
                fieldList: Object.entries(loading(true)).map(([key]) => key),
            }).then(results => {
                setAggregations(aggregations => ({...(aggregations || {}), ...results.aggregations}))
                setAggregationsLoading(loading(false))
            }).catch(error => {
                if (error.name !== 'AbortError') {
                    setAggregations(null)
                    setAggregationsError(error.message)
                    setAggregationsLoading(loading(false))
                }
            })
        }
        prevFacetsQueryRef.current = query
    }, [JSON.stringify({
        ...query,
        page: null,
        size: null,
        order: null,
    })])

    return {
        aggregations, setAggregations, aggregationsTasks, aggregationsLoading, aggregationsError,
    }
}
