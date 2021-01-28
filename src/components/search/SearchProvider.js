import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import qs from 'qs'
import fixLegacyQuery from '../../fixLegacyQuery'
import { doc as docAPI } from '../../backend/api'
import { documentViewUrl } from '../../utils'
import { buildSearchQuerystring, unwindParams } from '../../queryUtils'
import { aggregations as aggregationsAPI, search as searchAPI } from '../../api'

const SearchContext = createContext({})

function SearchProvider({ children, serverQuery }) {
    const router = useRouter()
    const { pathname } = router

    const queryString = typeof window === 'undefined' ? serverQuery : window.location.href.split('?')[1]
    const query = useMemo(() => {
        const memoQuery = unwindParams(qs.parse(queryString, { arrayLimit: 100 }))
        fixLegacyQuery(memoQuery)
        return memoQuery
    }, [queryString])

    const search = useCallback(params => {
        const newQuery = buildSearchQuerystring({ ...query, ...params })
        router.push(
            { pathname, search: newQuery },
            undefined,
            { shallow: true },
        )
    }, [query])

    const [previewOnLoad, setPreviewOnLoad] = useState()
    const [selectedDocUrl, setSelectedDocUrl] = useState()
    const [selectedDocData, setSelectedDocData] = useState()
    const [previewLoading, setPreviewLoading] = useState(false)
    const handleDocPreview = useCallback(url => {
        setSelectedDocUrl(url)
        setPreviewLoading(true)
        docAPI(url).then(data => {
            setSelectedDocData(data)
            setPreviewLoading(false)
        })
    }, [])

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
                    handleDocPreview(documentViewUrl(results.hits.hits[0]))
                } else if (previewOnLoad === 'last') {
                    setPreviewOnLoad(null)
                    handleDocPreview(documentViewUrl(results.hits.hits[results.hits.hits.length - 1]))
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
    })])

    const clearResults = () => {
        setResults(null)
    }

    const currentIndex = useMemo(() => results?.hits.hits.findIndex(
        hit => documentViewUrl(hit) === selectedDocUrl
    ), [results, selectedDocUrl])

    const previewNextDoc = useCallback(() => {
        if (!resultsLoading && results?.hits.hits) {
            if ((parseInt(query.page) - 1) * parseInt(query.size) + currentIndex < results.hits.total - 1) {
                if (currentIndex === results.hits.hits.length - 1) {
                    setPreviewOnLoad('first')
                    search({ page: parseInt(query.page) + 1 })
                } else {
                    handleDocPreview(documentViewUrl(results.hits.hits[currentIndex + 1]))
                }
            }
        }
    }, [query, results, resultsLoading, selectedDocUrl])

    const previewPreviousDoc = useCallback(() => {
        if (!resultsLoading && results?.hits.hits && selectedDocUrl) {
            if (parseInt(query.page) > 1 || currentIndex >= 1) {
                if (currentIndex === 0 && parseInt(query.page) > 1) {
                    setPreviewOnLoad('last')
                    search({ page: parseInt(query.page) - 1 })
                } else {
                    handleDocPreview(documentViewUrl(results.hits.hits[currentIndex - 1]))
                }
            }
        }
    }, [query, results, resultsLoading, selectedDocUrl])

    return (
        <SearchContext.Provider value={{
            query, error, search, results, aggregations,
            previewLoading, resultsLoading, aggregationsLoading,
            handleDocPreview, selectedDocUrl, selectedDocData,
            previewNextDoc, previewPreviousDoc, clearResults,
        }}>
            {children}
        </SearchContext.Provider>
    )
}

function useSearch() {
    const context = useContext(SearchContext)
    if (context === undefined) {
        throw new Error('useSearch must be used within a SearchProvider')
    }
    return context
}

export { SearchProvider, useSearch }
