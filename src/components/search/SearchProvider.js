import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import qs from 'qs'
import { Button, IconButton, Snackbar } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { tags as tagsAPI } from '../../backend/api'
import { TAGS_REFRESH_DELAYS } from '../../constants/general'
import { reactIcons } from '../../constants/icons'
import { availableColumns } from '../../constants/availableColumns'
import fixLegacyQuery from '../../utils/fixLegacyQuery'
import { buildSearchQuerystring, unwindParams } from '../../utils/queryUtils'
import { getPreviewParams } from '../../utils/utils'
import useResultsSearch from './useResultsSearch'
import useAggregationsSearch from './useAggregationsSearch'
import useMissingSearch from './useMissingSearch'
import { useSharedStore } from '../SharedStoreProvider'

const useStyles = makeStyles((theme) => ({
    close: {
        padding: theme.spacing(0.5),
    },
}))

const SearchContext = createContext({})

export function SearchProvider({ children, serverQuery }) {
    const classes = useStyles()
    const router = useRouter()
    const { pathname } = router

    const { hashState, setHashState } = useSharedStore().hashStore

    const queryString = typeof window === 'undefined' ? serverQuery : window.location.href.split('?')[1]?.split('#')[0]
    const query = useMemo(() => {
        const memoQuery = unwindParams(qs.parse(queryString, { arrayLimit: 100 }))
        fixLegacyQuery(memoQuery)
        return memoQuery
    }, [queryString])

    const [searchText, setSearchText] = useState(query.q || '')
    useEffect(() => {
        setSearchText(query.q)
    }, [query])

    const search = useCallback(
        (params) => {
            const newQuery = buildSearchQuerystring({ ...query, q: searchText, ...params })
            router.push({ pathname, search: newQuery, hash: window.location.hash.substring(1) }, undefined, { shallow: true })
        },
        [query, hashState, searchText]
    )

    const [previewOnLoad, setPreviewOnLoad] = useState()
    const [selectedDocData, setSelectedDocData] = useState()
    useEffect(() => {
        if (hashState?.preview) {
            setSelectedDocData(hashState.preview)
        }
    }, [JSON.stringify(hashState?.preview)])

    const [resultsViewType, setResultsViewType] = useState('list')
    const [resultsColumns, setResultsColumns] = useState(Object.entries(availableColumns).filter(([, { hidden }]) => !hidden))

    const [collectionsCount, setCollectionsCount] = useState([])

    const { results, setResults, resultsTask, resultsLoading, error } = useResultsSearch(query, previewOnLoad, setPreviewOnLoad, setHashState)

    const [forcedRefresh, forceRefresh] = useState({})
    const { aggregations, setAggregations, aggregationsTasks, aggregationsLoading, aggregationsError } = useAggregationsSearch(
        query,
        forcedRefresh,
        setCollectionsCount
    )

    const { missingAggregations, setMissingAggregations, missingTasks, loadMissing, missingLoading } = useMissingSearch(query)

    const clearResults = () => {
        setSelectedDocData(null)
        setCollectionsCount(null)
        setResults(null)
        setAggregations(null)
        setMissingAggregations(null)
    }

    const currentIndex = results?.hits.hits.findIndex((hit) => hit._collection === hashState.preview?.c && hit._id === hashState.preview?.i)

    const previewNextDoc = useCallback(() => {
        if (!resultsLoading && results?.hits.hits && (parseInt(query.page) - 1) * parseInt(query.size) + currentIndex < results.hits.total - 1) {
            if (currentIndex === results.hits.hits.length - 1) {
                setPreviewOnLoad('first')
                search({ page: parseInt(query.page) + 1 })
            } else {
                setHashState({ ...getPreviewParams(results.hits.hits[currentIndex + 1]), tab: undefined, subTab: undefined, previewPage: undefined })
            }
        }
    }, [query, hashState, results, resultsLoading])

    const previewPreviousDoc = useCallback(() => {
        if ((!resultsLoading && results?.hits.hits && parseInt(query.page) > 1) || currentIndex >= 1) {
            if (currentIndex === 0 && parseInt(query.page) > 1) {
                setPreviewOnLoad('last')
                search({ page: parseInt(query.page) - 1 })
            } else {
                setHashState({ ...getPreviewParams(results.hits.hits[currentIndex - 1]), tab: undefined, subTab: undefined, previewPage: undefined })
            }
        }
    }, [query, hashState, results, resultsLoading])

    const periodicallyCheckIndexedTime = (digestUrl) => {
        let timeout,
            delayIndex = 0

        const promise = new Promise((resolve, reject) => {
            const runDelayedQuery = (delay) => {
                timeout = setTimeout(() => {
                    tagsAPI(digestUrl).then((data) => {
                        if (data.every((tag) => !!tag.date_indexed)) {
                            resolve()
                        } else if (delayIndex < TAGS_REFRESH_DELAYS.length) {
                            runDelayedQuery(TAGS_REFRESH_DELAYS[delayIndex++])
                        } else {
                            reject()
                        }
                    })
                }, delay)
            }
            runDelayedQuery(TAGS_REFRESH_DELAYS[delayIndex++])
        })

        const cancel = () => clearTimeout(timeout)

        return { cancel, promise }
    }

    const [tagsRefreshQueue, setTagsRefreshQueue] = useState(null)
    const addTagToRefreshQueue = (digestUrl) => {
        if (tagsRefreshQueue) {
            tagsRefreshQueue.cancel()
        }
        setTagsRefreshQueue(periodicallyCheckIndexedTime(digestUrl))
    }

    const [snackbarMessage, setSnackbarMessage] = useState(null)
    const handleSnackbarClose = () => setSnackbarMessage(null)
    useEffect(() => {
        if (tagsRefreshQueue) {
            tagsRefreshQueue.promise
                .then(() => {
                    setTagsRefreshQueue(null)
                    setSnackbarMessage(
                        <Button
                            color="inherit"
                            startIcon={reactIcons.refresh}
                            onClick={() => {
                                handleSnackbarClose()
                                forceRefresh({})
                            }}>
                            Refresh for new tags
                        </Button>
                    )
                })
                .catch(() => {
                    setTagsRefreshQueue(null)
                })
        }

        return () => {
            if (tagsRefreshQueue) {
                tagsRefreshQueue.cancel()
            }
        }
    }, [tagsRefreshQueue])

    return (
        <SearchContext.Provider
            value={{
                query,
                search,
                searchText,
                setSearchText,
                collectionsCount,
                error,
                results,
                resultsTask,
                resultsLoading,
                aggregations,
                aggregationsTasks,
                aggregationsLoading,
                aggregationsError,
                missingAggregations,
                loadMissing,
                missingLoading,
                missingTasks,
                previewNextDoc,
                previewPreviousDoc,
                selectedDocData,
                clearResults,
                addTagToRefreshQueue,
                resultsViewType,
                setResultsViewType,
                resultsColumns,
                setResultsColumns,
            }}>
            {children}
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={Boolean(snackbarMessage)}
                autoHideDuration={30000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                ClickAwayListenerProps={{
                    mouseEvent: false,
                    touchEvent: false,
                }}
                action={
                    <IconButton aria-label="close" color="inherit" className={classes.close} onClick={handleSnackbarClose} size="large">
                        {reactIcons.close}
                    </IconButton>
                }
            />
        </SearchContext.Provider>
    )
}

export const useSearch = () => useContext(SearchContext)
