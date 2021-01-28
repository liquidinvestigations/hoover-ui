import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import { Divider, Grid, List, TextField, Typography } from '@material-ui/core'
import Expandable from '../Expandable'
import SplitPaneLayout from '../SplitPaneLayout'
import { ProgressIndicatorContext } from '../ProgressIndicator'
import { useSearch } from './SearchProvider'
import HotKeys from './HotKeys'
import FiltersChips from './FiltersChips'
import QueryChips from './QueryChips'
import SearchResults from './Results'
import Filters from './filters/Filters'
import CollectionsFilter from './filters/CollectionsFilter'
import { DEFAULT_MAX_RESULTS, SEARCH_GUIDE } from '../../constants'
import Preview from './Preview'
import SortingChips from './sorting/SortingChips'
import SortingMenu from './sorting/SortingMenu'

const useStyles = makeStyles(theme => ({
    error: {
        paddingTop: theme.spacing(3),
    },
    main: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    info: {
        color: theme.palette.grey.A700,
    },
    collections: {
        paddingBottom: 0,
    },
    filters: {
        paddingTop: 0,
    },
    sorting: {
        display: 'flex',
        marginTop: theme.spacing(2),
        justifyContent: 'flex-end',
    },
}))

export default function Search({ collections }) {
    const classes = useStyles()
    const inputRef = useRef()
    const { query, error, search, results, resultsLoading, clearResults } = useSearch()

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
        setLoading(resultsLoading)
    }, [resultsLoading])

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

    const handleCollectionsChange = useCallback(value => {
        search({ collections: value, page: 1 })
    }, [collections, search])

    const handleSubmit = useCallback(event => {
        event.preventDefault()
        search({ q: inputRef.current.value, page: 1 })
    }, [search])

    const handleInputKey = useCallback(event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            handleSubmit(event)
        }
    }, [search])

    return (
        <HotKeys inputRef={inputRef}>
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

                        <Filters className={classes.filters} />
                    </>
                }
                right={<Preview />}
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

                            <FiltersChips />

                            <QueryChips />

                            <div className={classes.sorting}>
                                <SortingChips />
                                <SortingMenu />
                            </div>
                        </Grid>
                    </Grid>

                    {error && (
                        <div className={classes.error}>
                            <Typography color="error">{error}</Typography>
                        </div>
                    )}

                    <Grid container>
                        <Grid item sm={12}>
                            <SearchResults maxCount={maxResultsCount} />
                        </Grid>
                    </Grid>
                </div>
            </SplitPaneLayout>
        </HotKeys>
    )
}
