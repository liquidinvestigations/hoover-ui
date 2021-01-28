import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import { Divider, Grid, List, TextField, Typography } from '@material-ui/core'
import Expandable from '../Expandable'
import SplitPaneLayout from '../SplitPaneLayout'
import { ProgressIndicatorContext } from '../ProgressIndicator'
import Document from '../document/Document'
import { useSearch } from './SearchProvider'
import HotKeys from './HotKeys'
import SearchQueryChips from './QueryChips'
import SearchResults from './Results'
import Sorting from './sorting/Sorting'
import Filters from './filters/Filters'
import CollectionsFilter from './filters/CollectionsFilter'
import { DEFAULT_MAX_RESULTS, SEARCH_GUIDE } from '../../constants'

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

export default function Search({ collections }) {
    const classes = useStyles()
    const inputRef = useRef()

    const {
        query,
        error,

        search,
        results,
        aggregations,

        previewLoading,
        resultsLoading,
        aggregationsLoading,

        handleDocPreview,
        selectedDocUrl,
        selectedDocData,
        previewNextDoc,
        previewPreviousDoc,

        clearResults,
    } = useSearch()

    useEffect(() => {
        if (query.q) {
            inputRef.current.value = query.q
        }
    }, [query])

    const clearSearchResults = url => {
        if (url === '/') {
            clearResults()
            inputRef.current.value = null
            inputRef.current.focus()
        }
    }
    useEffect(() => {
        Router.events.on('routeChangeStart', clearSearchResults)
        return () => {
            Router.events.off('routeChangeStart', clearSearchResults)
        }
    }, [])

    const { setLoading } = useContext(ProgressIndicatorContext)
    useEffect(() => {
        setLoading(resultsLoading || previewLoading)
    }, [resultsLoading, previewLoading])

    const maxResultsCount = useMemo(() => collections
            .filter(collection => query.collections?.includes(collection.name))
            .reduce((accumulator, collection) => {
                if (!isNaN(collection.max_result_window) && collection.max_result_window < accumulator) {
                    return collection.max_result_window
                }
                return accumulator
            }, DEFAULT_MAX_RESULTS),
        [collections, query]
    )

    const handleCollectionsChange = useCallback(collections => {
        search({ q: inputRef.current.value, collections, page: 1 })
    }, [collections, search])

    const handleSizeChange = useCallback(size => {
        search({ q: inputRef.current.value, size, page: 1 })
    }, [search])

    const handleOrderChange = useCallback(order => {
        search({ q: inputRef.current.value, order, page: 1 })
    }, [search])

    const handlePageChange = useCallback(page => {
        search({ q: inputRef.current.value, page })
    }, [search])

    const handleSearchTrigger = useCallback(params => {
        search({ ...query, ...params, q: inputRef.current.value, page: 1 })
    }, [search, query])

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        search({ q: inputRef.current.value, page: 1 })
    }, [search])

    const handleSearch = useCallback(q => {
        search({ q: inputRef.current.value, page: 1 })
    }, [search])

    const handleInputKey = useCallback(event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            search({ q: inputRef.current.value, page: 1 })
        }
    }, [search])

    return (
        <HotKeys
            inputRef={inputRef}
            selectedDocUrl={selectedDocUrl}
            selectedDocData={selectedDocData}
            previewNextDoc={previewNextDoc}
            previewPreviousDoc={previewPreviousDoc}
        >
            <SplitPaneLayout
                left={
                    <>
                        <List dense className={classes.collections}>
                            <Expandable
                                title={`Collections (${query.collections?.length || 0})`}
                                defaultOpen
                                highlight={false}
                            >
                                <CollectionsFilter
                                    collections={collections}
                                    selected={query.collections || []}
                                    changeSelection={handleCollectionsChange}
                                    counts={results?.count_by_index}
                                />
                                <Divider />
                            </Expandable>
                        </List>

                        <Filters
                            loading={aggregationsLoading || resultsLoading}
                            query={query}
                            aggregations={aggregations}
                            triggerSearch={handleSearchTrigger}
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
                                    inputRef={inputRef}
                                    label="Search"
                                    type="search"
                                    margin="normal"
                                    defaultValue={query.q || ''}
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
                                order={query.order}
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
        </HotKeys>
    )
}
