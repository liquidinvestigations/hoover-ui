import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cn from 'classnames'
import Router from 'next/router'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import { Button, FormControl, Grid, IconButton, InputAdornment, TextField, Toolbar, Tooltip, Typography } from '@material-ui/core'
import { Cancel, Collections, DoubleArrow, PinDrop } from '@material-ui/icons'
import Expandable from '../Expandable'
import SplitPaneLayout from '../SplitPaneLayout'
import { useProgressIndicator } from '../ProgressIndicator'
import { useSearch } from './SearchProvider'
import HotKeys from './HotKeys'
import FiltersChips from './filters/FiltersChips'
import QueryChips from './QueryChips'
import Histogram from './filters/Histogram'
import SearchResults from './Results'
import Filters from './filters/Filters'
import CollectionsFilter from './filters/CollectionsFilter'
import { DEFAULT_MAX_RESULTS, SEARCH_GUIDE } from '../../constants/general'
import SortingChips from './sorting/SortingChips'
import SortingMenu from './sorting/SortingMenu'
import { DocumentProvider } from '../document/DocumentProvider'
import Document from '../document/Document'
import CategoryDrawer from './filters/CategoryDrawer'
import { aggregationCategories, aggregationFields } from '../../constants/aggregationFields'

const useStyles = makeStyles(theme => ({
    error: {
        paddingTop: theme.spacing(3),
    },
    main: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    clear: {
        color: theme.palette.grey.A100,
    },
    info: {
        color: theme.palette.grey.A700,
    },
    sorting: {
        display: 'flex',
        marginTop: theme.spacing(2),
        justifyContent: 'flex-end',
    },
    drawerToolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
    },
    drawerToolbarButton: {
        marginLeft: 'auto',
        [theme.breakpoints.up('sm')]: {
            marginRight: -8,
        },
    },
    drawerToolbarIcon: {
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    filters: {
        width: 210,
        borderRight: '1px solid rgba(0, 0, 0, 0.2)',
    },
    expanded: {
        transform: 'rotate(180deg)',
    }
}))

export default function Search({ collections }) {
    const classes = useStyles()
    const inputRef = useRef()
    const { query, aggregations, error, search, searchText, setSearchText, resultsLoading,
        clearResults, collectionsCount, selectedDocData, previewNextDoc, previewPreviousDoc } = useSearch()

    const clearInput = () => {
        setSearchText('')
        inputRef.current.focus()
    }

    const clearSearchResults = url => {
        if (url === '/') {
            clearInput()
            clearResults()
            setDrawerOpenCategory('collections')
        }
    }
    useEffect(() => {
        Router.events.on('routeChangeStart', clearSearchResults)
        return () => {
            Router.events.off('routeChangeStart', clearSearchResults)
        }
    }, [])

    const { setLoading } = useProgressIndicator()
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

    const filtersCategories = useMemo(() => Object.entries(aggregationCategories).reduce((acc, [category, { label, icon, filters }]) => {
        acc[category] = {
            label,
            icon,
            filters: filters.map(field => ({ field, ...aggregationFields[field] })),
        }
        return acc
    }, {}), [aggregationCategories, aggregationFields])

    const [drawerOpenCategory, setDrawerOpenCategory] = useState('collections')
    const [expandedFilters, setExpandedFilters] = useState(
        Object.entries(filtersCategories).reduce((acc, [category, { filters }]) => {
            if (!acc[category]) {
                filters.some(({ field }) => {
                    const queryFilter = query.filters?.[field]
                    if (!!queryFilter?.include?.length || !!queryFilter?.exclude?.length || !!queryFilter?.missing ||
                        !!(queryFilter?.from || queryFilter?.to || queryFilter?.intervals)) {
                        acc[category] = field
                        return true
                    }
                })
            }

            if (!acc[category]) {
                filters.some(({ field }) => {
                    if (!!aggregations?.[field]?.values.buckets.length) {
                        acc[category] = field
                        return true
                    }
                })
            }

            if (!acc[category]) {
                acc[category] = filters[0].field
            }

            return acc
        }, {})
    )

    const handleSubmit = event => {
        event.preventDefault()
        search({ page: 1 })
    }

    const handleInputKey = event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            handleSubmit(event)
        }
    }

    const handleInputChange = event => {
        setSearchText(event.target.value)
    }

    return (
        <DocumentProvider
            id={selectedDocData?.i}
            collection={selectedDocData?.c}
            collections={collections}
        >
            <HotKeys inputRef={inputRef}>
                <Grid container>
                    <Grid item className={classes.filters}>
                        {/*
                        <Toolbar variant="dense" className={classes.drawerToolbar}>
                            <Tooltip title="Collapse">
                                <IconButton
                                    size="small"
                                    className={classes.drawerToolbarButton}
                                    disabled
                                >
                                    <DoubleArrow className={cn(classes.drawerToolbarIcon, { [classes.expanded]: true })} />
                                </IconButton>
                            </Tooltip>
                        </Toolbar>
                        */}

                        <CategoryDrawer
                            key="collections"
                            title="Collections"
                            icon={<Collections />}
                            highlight={false}
                            open={drawerOpenCategory === 'collections'}
                            onOpen={() => setDrawerOpenCategory('collections')}
                        >
                            <Expandable
                                title={`Collections (${query.collections?.length || 0})`}
                                open={true}
                                highlight={false}
                            >
                                <CollectionsFilter
                                    collections={collections}
                                    selected={query.collections || []}
                                    changeSelection={handleCollectionsChange}
                                    counts={collectionsCount}
                                />
                            </Expandable>
                        </CategoryDrawer>

                        <Filters
                            categories={filtersCategories}
                            drawerOpenCategory={drawerOpenCategory}
                            onDrawerOpen={setDrawerOpenCategory}
                            expandedFilters={expandedFilters}
                            onFilterExpand={setExpandedFilters}
                        />
                    </Grid>

                    <Grid item style={{ flex: 1 }}>
                        <SplitPaneLayout
                            left={
                                <>
                                    {/*
                                    <Toolbar variant="dense" className={classes.drawerToolbar}>
                                        <Tooltip title="Unpin">
                                            <IconButton
                                                size="small"
                                                className={classes.drawerToolbarButton}
                                                disabled
                                            >
                                                <PinDrop className={classes.drawerToolbarIcon} />
                                            </IconButton>
                                        </Tooltip>
                                    </Toolbar>
                                    */}

                                    <div id="category-drawer" />
                                </>
                            }
                            right={
                                <Document
                                    onPrev={previewPreviousDoc}
                                    onNext={previewNextDoc}
                                />
                            }
                        >
                            <div className={classes.main}>
                                <Grid container>
                                    <Grid item sm={12}>
                                        <form onSubmit={handleSubmit}>
                                            <Grid container justify="space-between" alignItems="flex-end">
                                                <Grid item style={{ flex: 1 }}>
                                                    <TextField
                                                        inputRef={inputRef}
                                                        label="Search"
                                                        margin="normal"
                                                        value={searchText}
                                                        onKeyDown={handleInputKey}
                                                        onChange={handleInputChange}
                                                        autoFocus
                                                        fullWidth
                                                        multiline
                                                        InputProps={{ endAdornment:
                                                            <InputAdornment position="end">
                                                                <IconButton onClick={clearInput} size="small">
                                                                    <Cancel className={classes.clear} />
                                                                </IconButton>
                                                            </InputAdornment>,
                                                        }}
                                                    />
                                                </Grid>

                                                <Grid item style={{ marginLeft: 20 }}>
                                                    <FormControl margin="normal">
                                                        <Button variant="contained" color="primary" type="submit" size="large">
                                                            Search
                                                        </Button>
                                                    </FormControl>
                                                </Grid>
                                            </Grid>
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

                                        <Histogram title="Date modified" field="date" />

                                        <Histogram title="Date created" field="date-created" />

                                        <div className={classes.sorting}>
                                            <SortingChips />
                                            <SortingMenu />
                                        </div>
                                    </Grid>
                                </Grid>

                                {error && <Typography color="error" className={classes.error}>{error}</Typography>}

                                <Grid container>
                                    <Grid item sm={12}>
                                        <SearchResults maxCount={maxResultsCount} />
                                    </Grid>
                                </Grid>
                            </div>
                        </SplitPaneLayout>
                    </Grid>
                </Grid>
            </HotKeys>
        </DocumentProvider>
    )
}
