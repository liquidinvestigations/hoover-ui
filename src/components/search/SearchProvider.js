import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import qs from 'qs'
import fixLegacyQuery from '../../fixLegacyQuery'
import { documentViewUrl } from '../../utils'
import { buildSearchQuerystring, rollupParams, unwindParams } from '../../queryUtils'
import { aggregations as aggregationsAPI, search as searchAPI } from '../../api'

const SearchContext = createContext({})

export function SearchProvider({ children, serverQuery }) {
    const router = useRouter()
    const { pathname } = router

    const queryString = typeof window === 'undefined' ? serverQuery : window.location.href.split('?')[1]?.split('#')[0]
    const query = useMemo(() => {
        const memoQuery = unwindParams(qs.parse(queryString, { arrayLimit: 100 }))
        fixLegacyQuery(memoQuery)
        return memoQuery
    }, [queryString])

    const hashString = typeof window !== 'undefined' && window.location.hash.substring(1) || ''
    const hash = useMemo(() => unwindParams(qs.parse(hashString)), [hashString])

    const search = useCallback(params => {
        const newQuery = buildSearchQuerystring({ ...query, ...params })
        router.push(
            { pathname, search: newQuery },
            undefined,
            { shallow: true },
        )
    }, [query])

    const setHash = useCallback(hashParams => {
        const newQuery = buildSearchQuerystring(query)
        const newHash = qs.stringify(rollupParams({...hash, ...hashParams}))
        router.push(
            { pathname, search: newQuery, hash: newHash },
            undefined,
            { shallow: true },
        )
    }, [query, hash])

    const [previewOnLoad, setPreviewOnLoad] = useState()
    const [selectedDocData, setSelectedDocData] = useState()
    const getPreviewParams = item => ({ preview: { c: item._collection, i: item._id } })
    useEffect(() => {
        if (hash.preview) {
            setSelectedDocData(hash.preview)
        }
    }, [hash.preview])

    const [error, setError] = useState()
    const [results, setResults] = useState()
    const [resultsLoading, setResultsLoading] = useState(!!query.q)
    useEffect(() => {
        if (query.q) {
            setError(null)
            setResultsLoading(true)

            searchAPI(query).then(results => {
                setResults(results)
                setResultsLoading(false)

                if (previewOnLoad === 'first') {
                    setPreviewOnLoad(null)
                    setHash(getPreviewParams(results.hits.hits[0]))
                } else if (previewOnLoad === 'last') {
                    setPreviewOnLoad(null)
                    setHash(getPreviewParams(results.hits.hits[results.hits.hits.length - 1]))
                }
            }).catch(error => {
                setResults(null)
                setError(error.reason ? error.reason : error.message)
                setResultsLoading(false)
            })
        }
    }, [JSON.stringify({
        ...query,
        facets: null,
        preview: null,
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
    const [aggregationsLoading, setAggregationsLoading] = useState(!!query.q)
    useEffect(() => {
        if (query.q) {
            setAggregationsLoading(true)

            aggregationsAPI(query).then(results => {
                setAggregations(results.aggregations)
                setAggregationsLoading(false)
            }).catch(error => {
                setAggregations(null)
                //setError(error.reason ? error.reason : error.message)
                setAggregationsLoading(false)
            })
        }
    }, [JSON.stringify({
        ...query,
        page: null,
        size: null,
        order: null,
        preview: null,
    })])

    const clearResults = () => {
        setResults(null)
    }

    const currentIndex = useMemo(() => results?.hits.hits.findIndex(
        hit => documentViewUrl(hit) === query.preview
    ), [query, results])

    const previewNextDoc = useCallback(() => {
        if (!resultsLoading && results?.hits.hits) {
            if ((parseInt(query.page) - 1) * parseInt(query.size) + currentIndex < results.hits.total - 1) {
                if (currentIndex === results.hits.hits.length - 1) {
                    setPreviewOnLoad('first')
                    search({ page: parseInt(query.page) + 1 })
                } else {
                    setHash(getPreviewParams(results.hits.hits[currentIndex + 1]))
                }
            }
        }
    }, [query, results, resultsLoading])

    const previewPreviousDoc = useCallback(() => {
        if (!resultsLoading && results?.hits.hits && query.preview) {
            if (parseInt(query.page) > 1 || currentIndex >= 1) {
                if (currentIndex === 0 && parseInt(query.page) > 1) {
                    setPreviewOnLoad('last')
                    search({ page: parseInt(query.page) - 1 })
                } else {
                    setHash(getPreviewParams(results.hits.hits[currentIndex - 1]))
                }
            }
        }
    }, [query, results, resultsLoading])

    return (
        <SearchContext.Provider value={{
            query, error, search, results, aggregations,
            resultsLoading, aggregationsLoading,
            previewNextDoc, previewPreviousDoc, selectedDocData,
            clearResults, getPreviewParams, hash, setHash,
        }}>
            {children}
        </SearchContext.Provider>
    )
}

export const useSearch = () => useContext(SearchContext)
