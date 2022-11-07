import { useEffect, useRef, useState } from 'react'
import { search as searchAPI } from '../../api'
import { asyncSearch as asyncSearchAPI } from '../../backend/api'
import { aggregationFields } from '../../constants/aggregationFields'

const maxAggregationsBatchSize = Math.ceil(Object.entries(aggregationFields).length /* / process.env.AGGREGATIONS_SPLIT */)
const aggregationGroups = Object.entries(aggregationFields).reduce((acc, [key]) => {
    if (acc?.[acc.length - 1]?.fieldList?.length < maxAggregationsBatchSize) {
        acc[acc.length - 1].fieldList.push(key)
    } else {
        acc.push({ fieldList: [key] })
    }
    return acc
}, [])

export default function useAggregationsSearch(query, forcedRefresh, setCollectionsCount) {
    const buildAggregationsKeysMap = (value) =>
        Object.entries(aggregationFields).reduce((acc, [field]) => {
            acc[field] = value
            return acc
        }, {})

    const buildAggregationsGroupsMap = (value) =>
        aggregationGroups.reduce((acc, { fieldList }) => {
            acc[fieldList.join()] = value
            return acc
        }, {})

    const prevForcedRefreshRef = useRef()
    const [aggregations, setAggregations] = useState()
    const [aggregationsError, setAggregationsError] = useState()
    const [aggregationsTasks, setAggregationsTasks] = useState({})
    const [aggregationsLoading, setAggregationsLoading] = useState(buildAggregationsKeysMap(!!query.collections?.length))
    const [aggregationsTaskRequestCounter, setAggregationsTaskRequestCounter] = useState(buildAggregationsGroupsMap(0))

    const handleAggregationsError = (error) => {
        if (error.name !== 'AbortError') {
            setAggregations(null)
            setAggregationsError(error.message)
            setAggregationsTasks({})
            setAggregationsLoading(buildAggregationsKeysMap(false))
            setAggregationsTaskRequestCounter(buildAggregationsGroupsMap(0))
        }
    }

    useEffect(() => {
        if (query.collections?.length) {
            setAggregationsError(null)
            setAggregationsTasks({})
            setAggregationsLoading(buildAggregationsKeysMap(true))
            setAggregationsTaskRequestCounter(buildAggregationsGroupsMap(0))

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

                    setAggregationsTasks((tasks) => ({
                        ...tasks,
                        [aggregationGroup.fieldList.join()]: {
                            ...taskData,
                            initialEta: taskData?.eta.total_sec,
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
    }, [
        JSON.stringify({
            ...query,
            facets: null,
            page: null,
            size: null,
            order: null,
        }),
        forcedRefresh,
    ])

    useEffect(() => {
        let timeout

        setAggregationsTasks((prevAggregationsTasks) => {
            Object.entries(prevAggregationsTasks).forEach(([fields, taskData]) => {
                const done = (resultData) => {
                    setAggregations((aggregations) => ({ ...(aggregations || {}), ...resultData.aggregations }))
                    setCollectionsCount(resultData.count_by_index)
                    setAggregationsLoading((loading) => ({
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

                    const wait = taskData.eta.total_sec < process.env.ASYNC_SEARCH_POLL_INTERVAL ? true : ''

                    if (wait) {
                        setAggregationsTaskRequestCounter((counter) => ({
                            ...counter,
                            [fields]: counter[fields] + 1,
                        }))
                    }

                    asyncSearchAPI(taskData.task_id, wait)
                        .then((taskResultData) => {
                            const update = () =>
                                setAggregationsTasks((tasks) => ({
                                    ...tasks,
                                    [fields]: { ...tasks[fields], ...taskResultData, retrieving: false },
                                }))

                            if (taskResultData.status === 'done') {
                                done(taskResultData.result)
                            } else if (
                                Date.now() - Date.parse(taskResultData.date_created) <
                                (prevAggregationsTasks[fields].initialEta * process.env.ASYNC_SEARCH_ERROR_MULTIPLIER +
                                    process.env.ASYNC_SEARCH_ERROR_SUMMATION) *
                                    1000
                            ) {
                                timeout = setTimeout(update, process.env.ASYNC_SEARCH_POLL_INTERVAL * 1000)
                            } else {
                                handleAggregationsError(new Error('Aggregations task ETA timeout'))
                            }
                        })
                        .catch((error) => {
                            if (wait && error.name === 'TypeError') {
                                if (aggregationsTaskRequestCounter[fields] < process.env.ASYNC_SEARCH_MAX_FINAL_RETRIES) {
                                    setAggregationsTasks((tasks) => ({
                                        ...tasks,
                                        [fields]: { ...tasks[fields], retrieving: false },
                                    }))
                                } else {
                                    setAggregationsTasks((tasks) => ({
                                        ...tasks,
                                        [fields]: undefined,
                                    }))
                                }
                            } else {
                                handleAggregationsError(error)
                            }
                        })
                }
            })
            return prevAggregationsTasks
        })

        return () => {
            clearTimeout(timeout)
        }
    }, [aggregationsTasks])

    const prevFacetsQueryRef = useRef()
    const [facetsTasks, setFacetsTasks] = useState({})
    const [facetsTasksRequestCounter, setFacetsTasksRequestCounter] = useState(buildAggregationsKeysMap(0))

    const handleFacetsError = (error) => {
        if (error.name !== 'AbortError') {
            setAggregations(null)
            setAggregationsError(error.message)
            setAggregationsLoading(buildAggregationsKeysMap(false))
            setFacetsTasksRequestCounter(buildAggregationsKeysMap(0))
        }
    }

    useEffect(() => {
        ;(async () => {
            const { facets, page, size, order, ...queryRest } = query
            const { facets: prevFacets, page: prevPage, size: prevSize, order: prevOrder, ...prevQueryRest } = prevFacetsQueryRef.current || {}

            if (JSON.stringify(queryRest) === JSON.stringify(prevQueryRest) && JSON.stringify(facets) !== JSON.stringify(prevFacets)) {
                const changed = (state) =>
                    Object.entries({
                        ...(facets || {}),
                        ...(prevFacets || {}),
                    }).reduce((acc, [field]) => {
                        if (JSON.stringify(facets?.[field]) !== JSON.stringify(prevFacets?.[field])) {
                            acc[field] = state
                        }
                        return acc
                    }, {})

                setAggregationsError(null)
                setAggregationsLoading(changed(true))
                setFacetsTasksRequestCounter(buildAggregationsKeysMap(0))

                try {
                    const fieldList = Object.entries(changed(true)).map(([key]) => key)
                    const taskData = await searchAPI({
                        ...query,
                        q: query.q || '*',
                        type: 'aggregations',
                        fieldList,
                        async: true,
                    })

                    setFacetsTasks((tasks) => ({
                        ...tasks,
                        [fieldList.join(',')]: {
                            ...taskData,
                            initialEta: taskData?.eta.total_sec,
                        },
                    }))
                } catch (error) {
                    handleFacetsError(error)
                }
            }
            prevFacetsQueryRef.current = query
        })()
    }, [
        JSON.stringify({
            ...query,
            page: null,
            size: null,
            order: null,
        }),
    ])

    useEffect(() => {
        let timeout

        setFacetsTasks((prevFacetsTasks) => {
            Object.entries(prevFacetsTasks).forEach(([fields, taskData]) => {
                const done = (resultData) => {
                    setAggregations((aggregations) => ({ ...(aggregations || {}), ...resultData.aggregations }))
                    setAggregationsLoading((loading) => ({
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

                    const wait = taskData.eta.total_sec < process.env.ASYNC_SEARCH_POLL_INTERVAL ? true : ''

                    if (wait) {
                        setFacetsTasksRequestCounter((counter) => ({
                            ...counter,
                            [fields]: counter[fields] + 1,
                        }))
                    }

                    asyncSearchAPI(taskData.task_id, wait)
                        .then((taskResultData) => {
                            const update = () =>
                                setFacetsTasks((tasks) => ({
                                    ...tasks,
                                    [fields]: { ...tasks[fields], ...taskResultData, retrieving: false },
                                }))

                            if (taskResultData.status === 'done') {
                                done(taskResultData.result)
                            } else if (
                                Date.now() - Date.parse(taskResultData.date_created) <
                                (prevFacetsTasks.initialEta * process.env.ASYNC_SEARCH_ERROR_MULTIPLIER + process.env.ASYNC_SEARCH_ERROR_SUMMATION) *
                                    1000
                            ) {
                                timeout = setTimeout(update, process.env.ASYNC_SEARCH_POLL_INTERVAL * 1000)
                            } else {
                                handleFacetsError(new Error('Aggregations task ETA timeout'))
                            }
                        })
                        .catch((error) => {
                            if (wait && error.name === 'TypeError') {
                                if (facetsTasksRequestCounter[fields] < process.env.ASYNC_SEARCH_MAX_FINAL_RETRIES) {
                                    setFacetsTasks((tasks) => ({
                                        ...tasks,
                                        [fields]: { ...tasks[fields], retrieving: false },
                                    }))
                                } else {
                                    setFacetsTasks((tasks) => ({
                                        ...tasks,
                                        [fields]: undefined,
                                    }))
                                }
                            } else {
                                handleFacetsError(error)
                            }
                        })
                }
            })
            return prevFacetsTasks
        })

        return () => {
            clearTimeout(timeout)
        }
    }, [facetsTasks])

    return {
        aggregations,
        setAggregations,
        aggregationsTasks,
        aggregationsLoading,
        aggregationsError,
    }
}
