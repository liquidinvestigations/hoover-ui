import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import qs from 'qs'
import fixLegacyQuery from '../../fixLegacyQuery'
import { getPreviewParams } from '../../utils'
import { useHashState } from '../HashStateProvider'
import { buildSearchQuerystring, rollupParams, unwindParams } from '../../queryUtils'
import { search as searchAPI } from '../../api'

const SearchContext = createContext({})

export function SearchProvider({ children, serverQuery }) {
    const router = useRouter()
    const { pathname } = router

    const { hashState, setHashState } = useHashState()

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

    const search = useCallback(params => {
        const newQuery = buildSearchQuerystring({ ...query, q: searchText || '*', ...params })
        router.push(
            { pathname, search: newQuery, hash: hashState ? qs.stringify(rollupParams(hashState)) : undefined },
            undefined,
            { shallow: true },
        )
    }, [query, hashState, searchText])

    const [previewOnLoad, setPreviewOnLoad] = useState()
    const [selectedDocData, setSelectedDocData] = useState()
    useEffect(() => {
        if (hashState?.preview) {
            setSelectedDocData(hashState.preview)
        }
    }, [JSON.stringify(hashState?.preview)])

    const [collectionsCount, setCollectionsCount] = useState([])

    const [error, setError] = useState()
    const [results, setResults] = useState()
    const [resultsLoading, setResultsLoading] = useState(!!query.q)
    useEffect(() => {
        if (query.q) {
            setError(null)
            setResultsLoading(true)

            searchAPI({
                type: 'results',
                fieldList: '*',
                ...query,
            }).then(results => {
                setResults(results)
                setResultsLoading(false)
                setCollectionsCount(results.count_by_index)

                if (previewOnLoad === 'first') {
                    setPreviewOnLoad(null)
                    setHashState({ ...getPreviewParams(results.hits.hits[0]),
                        tab: undefined, subTab: undefined, previewPage: undefined })
                } else if (previewOnLoad === 'last') {
                    setPreviewOnLoad(null)
                    setHashState({ ...getPreviewParams(results.hits.hits[results.hits.hits.length - 1]),
                        tab: undefined, subTab: undefined, previewPage: undefined })
                }
            }).catch(error => {
                if (error.name !== 'AbortError') {
                    setResults(null)
                    setError(error.message)
                    setResultsLoading(false)
                }
            })
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

    const [aggregations, setAggregations] = useState()
    const [aggregationsError, setAggregationsError] = useState()
    const [aggregationsLoading, setAggregationsLoading] = useState(!!query.collections?.length)
    useEffect(() => {
        if (query.collections?.length) {
            setAggregationsError(null)
            setAggregationsLoading(true)

            searchAPI({
                type: 'aggregations',
                fieldList: '*',
                ...query,
            }).then(results => {
                setAggregations(results.aggregations)
                setCollectionsCount(results.count_by_index)
                setAggregationsLoading(false)
            }).catch(error => {
                if (error.name !== 'AbortError') {
                    setAggregations(null)
                    setAggregationsError(error.message)
                    setAggregationsLoading(false)
                }
            })
        } else {
            setAggregations(null)
        }
    }, [JSON.stringify({
        ...query,
        page: null,
        size: null,
        order: null,
    })])

    const clearResults = () => {
        setResults(null)
        setAggregations(null)
        setCollectionsCount(null)
        setSelectedDocData(null)
    }

    const currentIndex = results?.hits.hits.findIndex(
        hit => hit._collection === hashState.preview?.c && hit._id === hashState.preview?.i
    )

    const previewNextDoc = useCallback(() => {
        if (!resultsLoading && results?.hits.hits
            && (parseInt(query.page) - 1) * parseInt(query.size) + currentIndex < results.hits.total - 1) {
            if (currentIndex === results.hits.hits.length - 1) {
                setPreviewOnLoad('first')
                search({ page: parseInt(query.page) + 1 })
            } else {
                setHashState({ ...getPreviewParams(results.hits.hits[currentIndex + 1]),
                    tab: undefined, subTab: undefined, previewPage: undefined })
            }
        }
    }, [query, hashState, results, resultsLoading])

    const previewPreviousDoc = useCallback(() => {
        if (!resultsLoading && results?.hits.hits && parseInt(query.page) > 1 || currentIndex >= 1) {
            if (currentIndex === 0 && parseInt(query.page) > 1) {
                setPreviewOnLoad('last')
                search({ page: parseInt(query.page) - 1 })
            } else {
                setHashState({ ...getPreviewParams(results.hits.hits[currentIndex - 1]),
                    tab: undefined, subTab: undefined, previewPage: undefined })
            }
        }
    }, [query, hashState, results, resultsLoading])

    return (
        <SearchContext.Provider value={{
            query, error, search, searchText, setSearchText,
            results, aggregations, aggregationsError,
            collectionsCount, resultsLoading, aggregationsLoading,
            previewNextDoc, previewPreviousDoc, selectedDocData,
            clearResults
        }}>
            {children}
        </SearchContext.Provider>
    )
}

export const useSearch = () => useContext(SearchContext)
