import { useEffect, useState } from 'react'
import { getPreviewParams } from '../../utils'
import { search as searchAPI } from '../../api'
import { asyncSearch as asyncSearchAPI } from '../../backend/api'

export default function useResultsSearch(query, previewOnLoad, setPreviewOnLoad, setHashState) {
    const [error, setError] = useState()
    const [results, setResults] = useState()
    const [resultsTask, setResultsTask] = useState(null)
    const [resultsLoading, setResultsLoading] = useState(!!query.q)
    const handleResultsError = error => {
        if (error.name !== 'AbortError') {
            setResults(null)
            setError(error.message)
            setResultsLoading(false)
            setResultsTaskRequestCounter(0)
        }
    }

    useEffect(async () => {
        if (query.q) {
            setError(null)
            setResultsTask(null)
            setResultsLoading(true)

            try {
                const taskData = await searchAPI({
                    ...query,
                    type: 'results',
                    fieldList: '*',
                    async: true,
                })

                setResultsTask({ ...taskData, initialEta: taskData.eta?.total_sec })

            } catch(error) {
                handleResultsError(error)
            }

        } else {
            setResults(null)
        }
    }, [JSON.stringify({
        ...query,
        facets: null,
        filters: {
            ...query.filters || {},
            date: {
                from: query.filters?.date?.from,
                to: query.filters?.date?.to,
                intervals: query.filters?.date?.intervals,
            },
            ['date-created']: {
                from: query.filters?.['date-created']?.from,
                to: query.filters?.['date-created']?.to,
                intervals: query.filters?.['date-created']?.intervals,
            },
        }
    })])

    const [resultsTaskRequestCounter, setResultsTaskRequestCounter] = useState(0)

    useEffect(async () => {
        let timeout

        const prevTaskResults = resultsTask

        if (prevTaskResults) {
            if (prevTaskResults.status === 'done') {
                const results = prevTaskResults.result
                setResults(results)
                setResultsLoading(false)

                if (previewOnLoad === 'first') {
                    setPreviewOnLoad(null)
                    setHashState({
                        ...getPreviewParams(results.hits.hits[0]),
                        tab: undefined, subTab: undefined, previewPage: undefined
                    })
                } else if (previewOnLoad === 'last') {
                    setPreviewOnLoad(null)
                    setHashState({
                        ...getPreviewParams(results.hits.hits[results.hits.hits.length - 1]),
                        tab: undefined, subTab: undefined, previewPage: undefined
                    })
                }
            } else if (!prevTaskResults.retrieving) {
                prevTaskResults.retrieving = true

                const wait = prevTaskResults.eta.total_sec < process.env.ASYNC_SEARCH_POLL_INTERVAL ? true : ''

                if (wait) {
                    setResultsTaskRequestCounter(counter => counter + 1)
                }

                try {
                    const resultsTaskData = await asyncSearchAPI(prevTaskResults.task_id, wait)
                    const update = () => setResultsTask({ ...prevTaskResults, ...resultsTaskData, retrieving: false } )

                    if (resultsTaskData.status === 'done') {
                        update()
                    } else if (Date.now() - Date.parse(resultsTaskData.date_created) < (prevTaskResults.initialEta * process.env.ASYNC_SEARCH_ERROR_MULTIPLIER + process.env.ASYNC_SEARCH_ERROR_SUMMATION) * 1000) {
                        timeout = setTimeout(update, process.env.ASYNC_SEARCH_POLL_INTERVAL * 1000)
                    } else {
                        handleResultsError(new Error('Results task ETA timeout'))
                    }
                } catch (error) {
                    if (wait && error.name === 'TypeError' && resultsTaskRequestCounter < process.env.ASYNC_SEARCH_MAX_FINAL_RETRIES) {
                        setResultsTask({ ...prevTaskResults, retrieving: false } )
                    } else {
                        handleResultsError(error)
                    }
                }
            }
        }

        return () => {
            clearTimeout(timeout)
        }
    }, [resultsTask])

    return {
        results, setResults, resultsTask, resultsLoading, error,
    }
}
