import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Router, { useRouter } from 'next/router'
import Link from 'next/link'
import qs from 'qs'
import { makeStyles } from '@material-ui/core/styles'
import { Divider, Grid, List, TextField, Typography } from '@material-ui/core'
import SearchQueryChips from '../src/components/search/QueryChips'
import HotKeysWithHelp from '../src/components/HotKeysWithHelp'
import SplitPaneLayout from '../src/components/SplitPaneLayout'
import Sorting from '../src/components/search/sorting/Sorting'
import SearchResults from '../src/components/search/Results'
import Expandable from '../src/components/Expandable'
import Filters from '../src/components/search/filters/Filters'
import CollectionsFilter from '../src/components/search/filters/CollectionsFilter'
import Document from '../src/components/document/Document'
import { ProgressIndicatorContext } from '../src/components/ProgressIndicator'
import { DEFAULT_MAX_RESULTS, SEARCH_GUIDE } from '../src/constants'
import { copyMetadata, documentViewUrl } from '../src/utils'
import { buildSearchQuerystring, defaultSearchParams, unwindParams } from '../src/queryUtils'
import fixLegacyQuery from '../src/fixLegacyQuery'
import getAuthorizationHeaders from '../src/backend/getAuthorizationHeaders'
import { collections as collectionsAPI, doc as docAPI } from '../src/backend/api'
import { aggregations as aggregationsAPI, search as searchAPI } from '../src/api'

const useStyles = makeStyles(theme => ({
    error: {
        paddingTop: theme.spacing(3),
    },
    main: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    paper: {
        position: 'absolute',
        width: theme.spacing(50),
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(4),
    },
    info: {
        color: theme.palette.grey.A700,
    },
    collections: {
        paddingBottom: 0,
    },
    filters: {
        paddingTop: 0,
    }
}))

export default function Index({ collections, serverQuery }) {
    const classes = useStyles()
    const router = useRouter()
    const { pathname } = router

    const queryString = typeof window === 'undefined' ? serverQuery : window.location.href.split('?')[1]
    const query = useMemo(() => {
        const memoQuery = unwindParams(qs.parse(queryString, { arrayLimit: 100 }))
        fixLegacyQuery(memoQuery)
        return memoQuery
    }, [queryString])


    let [inputRef, setInputRef] = useState()
    const isInputFocused = () => inputRef === document.activeElement

    const maxResultsCount = useMemo(() => collections
            .filter(collection => selectedCollections.includes(collection.name))
            .reduce((accumulator, collection) => {
                if (!isNaN(collection.max_result_window) && collection.max_result_window < accumulator) {
                    return collection.max_result_window
                }
                return accumulator
            }, DEFAULT_MAX_RESULTS),
        [collections, selectedCollections]
    )

    const [q, setQ] = useState(query.q)
    const [order, setOrder] = useState(query.order)
    const [page, setPage] = useState(query.page || defaultSearchParams.page)
    const [size, setSize] = useState(query.size || defaultSearchParams.size)
    const [selectedCollections, setSelectedCollections] = useState(query.collections || [])

    const search = useCallback(params => {
        const stateParams = { q, size, order, page, collections: selectedCollections }
        const newQuery = buildSearchQuerystring({ ...query, ...stateParams, ...params })
        router.push(
            { pathname, search: newQuery },
            undefined,
            { shallow: true },
        )
    }, [text, size, order, page, selectedCollections, query, pathname])

    const handleSelectedCollectionsChange = useCallback(collections => {
        setSelectedCollections(collections)
        setPage(1)
        search({ collections, page: 1 })
    }, [collections, search])

    const handleSizeChange = useCallback(size => {
        setSize(size)
        setPage(1)
        search({ size, page: 1 })
    }, [search])

    const handleOrderChange = useCallback(order => {
        setOrder(order)
        setPage(1)
        search({ order, page: 1 })
    }, [search])

    const handlePageChange = useCallback(page => {
        setPage(page)
        search({ page })
    }, [search])

    const handleFilterApply = useCallback(filter => {
        const newFilters = { ...filters, ...filter }
        setFilters(newFilters)
        setPage(1)
        search({ filters: newFilters, page: 1 })
    }, [search])

    const handleInputChange = useCallback(event => {
        setQ(event.target.value)
    }, [])

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        setPage(1)
        search({ q, page: 1 })
    }, [q, search])

    const handleSearch = useCallback(q => {
        setQ(q)
        search({ q, page: 1 })
    }, [search])

    const handleInputKey = useCallback(event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            setPage(1)
            search({ q, page: 1 })
        }
    }, [text, search])


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
            setQ(query.q)

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


    const clearResults = url => {
        if (url === '/') {
            setResults(null)
            setQ('')
        }
    }

    useEffect(() => {
        Router.events.on('routeChangeStart', clearResults)
        return () => {
            Router.events.off('routeChangeStart', clearResults)
        }
    }, [])


    const currentIndex = useMemo(() => results?.hits.hits.findIndex(
        hit => documentViewUrl(hit) === selectedDocUrl
    ), [results, selectedDocUrl])

    const previewNextDoc = useCallback(() => {
        if (!resultsLoading && results?.hits.hits) {
            if ((parseInt(page) - 1) * size + currentIndex < results.hits.total - 1) {
                if (currentIndex === results.hits.hits.length - 1) {
                    setPage(parseInt(page) + 1)
                    setPreviewOnLoad('first')
                    search({ page: parseInt(page) + 1 })
                } else {
                    handleDocPreview(documentViewUrl(results.hits.hits[currentIndex + 1]))
                }
            }
        }
    }, [page, size, results, resultsLoading, selectedDocUrl])

    const previewPreviousDoc = useCallback(() => {
        if (!resultsLoading && results?.hits.hits && selectedDocUrl) {
            if (page > 1 || currentIndex >= 1) {
                if (currentIndex === 0 && page > 1) {
                    setPage(parseInt(page) - 1)
                    setPreviewOnLoad('last')
                    search({ page: parseInt(page) - 1 })
                } else {
                    handleDocPreview(documentViewUrl(results.hits.hits[currentIndex - 1]))
                }
            }
        }
    }, [page, size, results, resultsLoading, selectedDocUrl])

    const keys = useMemo(() => ({
        nextItem: {
            key: 'j',
            help: 'Preview next result',
            handler: event => {
                event.preventDefault()
                if (!isInputFocused()) {
                    previewNextDoc()
                }
            },
        },
        previousItem: {
            key: 'k',
            help: 'Preview the previous result',
            handler: event => {
                event.preventDefault()
                if (!isInputFocused()) {
                    previewPreviousDoc()
                }
            },
        },
        copyMetadata: {
            key: 'c',
            help: 'Copy metadata (MD5 and path) of the currently previewed item to the clipboard.',
            handler: (event, showMessage) => {
                if (isInputFocused()) {
                    return
                }
                event.preventDefault()
                if (selectedDocData?.content) {
                    showMessage(copyMetadata(selectedDocData))
                } else {
                    showMessage('Unable to copy metadata – no document selected?')
                }
            },
        },
        openItem: {
            key: 'o',
            help: 'Open the currently previewed result',
            handler: () => {
                isInputFocused() || (!!selectedDocUrl && window.open(selectedDocUrl, '_blank'))
            },
        },
        focusInputField: {
            key: '/',
            help: 'Focus the search field',
            handler: event => {
                if (!isInputFocused()) {
                    event.preventDefault()
                    inputRef && inputRef.focus()
                }
            },
        }
    }), [previewNextDoc, previewPreviousDoc, selectedDocData, selectedDocUrl])


    const { setLoading } = useContext(ProgressIndicatorContext)
    useEffect(() => {
        setLoading(resultsLoading || previewLoading)
    }, [resultsLoading, previewLoading])

    return (
        <HotKeysWithHelp keys={keys}>
            <SplitPaneLayout
                left={
                    <>
                        <List dense className={classes.collections}>
                            <Expandable
                                title={`Collections (${selectedCollections.length})`}
                                defaultOpen
                                highlight={false}
                            >
                                <CollectionsFilter
                                    collections={collections}
                                    selected={selectedCollections}
                                    changeSelection={handleSelectedCollectionsChange}
                                    counts={results?.count_by_index}
                                />
                                <Divider />
                            </Expandable>
                        </List>

                        <Filters
                            loading={aggregationsLoading || resultsLoading}
                            query={query}
                            aggregations={aggregations}
                            applyFilter={handleFilterApply}
                            className={classes.filters}
                        />
                    </>
                }
                right={
                    <Document
                        docUrl={selectedDocUrl}
                        data={selectedDocData}
                        loading={previewLoading}
                        onPrev={previewPreviousDoc}
                        onNext={previewNextDoc}
                    />
                }
            >
                <div className={classes.main}>
                    <Grid container>
                        <Grid item sm={12}>
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    inputRef={setInputRef}
                                    label="Search"
                                    type="search"
                                    margin="normal"
                                    value={q}
                                    onChange={handleInputChange}
                                    onKeyDown={handleInputKey}
                                    autoFocus
                                    fullWidth
                                    multiline
                                />
                            </form>

                            <Grid container justify="space-between">
                                <Grid item style={{ flex: 1 }}>
                                    <Typography variant="caption" className={classes.info}>
                                        Enter to search, Shift+Enter for a new line.
                                        All lines are combined into a single search.
                                        Refine your search using {' '}
                                        <a href={SEARCH_GUIDE}>this handy guide</a>.
                                    </Typography>
                                </Grid>

                                <Grid item style={{ marginLeft: 20 }}>
                                    <Typography variant="caption">
                                        <Link href="/batch-search">
                                            <a>Batch search</a>
                                        </Link>
                                    </Typography>
                                </Grid>
                            </Grid>

                            <SearchQueryChips query={query.q} onQueryChange={handleSearch} />

                            <Sorting
                                order={order}
                                changeOrder={handleOrderChange}
                            />
                        </Grid>
                    </Grid>

                    {error && (
                        <div className={classes.error}>
                            <Typography color="error">{error}</Typography>
                        </div>
                    )}

                    <Grid container>
                        <Grid item sm={12}>
                            <SearchResults
                                results={results}
                                maxCount={maxResultsCount}
                                loading={resultsLoading}
                                query={query}
                                changePage={handlePageChange}
                                changeSize={handleSizeChange}
                                onPreview={handleDocPreview}
                                selectedDocUrl={selectedDocUrl}
                            />
                        </Grid>
                    </Grid>
                </div>
            </SplitPaneLayout>
        </HotKeysWithHelp>
    )
}

export async function getServerSideProps({ req }) {
    const headers = getAuthorizationHeaders(req)
    const collections = await collectionsAPI(headers)

    const serverQuery = req.url.split('?')[1] || ''

    return { props: { collections, serverQuery }}
}
