import React, { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cn from 'classnames'
import Router from 'next/router'
import Link from 'next/link'
import { Transition } from 'react-transition-group'
import { duration, makeStyles } from '@material-ui/core/styles'
import { Button, FormControl, Grid, IconButton, InputAdornment, TextField, Toolbar, Tooltip, Typography } from '@material-ui/core'
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
import { reactIcons } from '../../constants/icons'
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
        marginRight: 11,
    },
    drawerToolbarIcon: {
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    filters: {
        width: 55,
        borderRight: '1px solid rgba(0, 0, 0, 0.2)',
        transition: theme.transitions.create('width', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    wideFilters: {
        width: 210,
    },
    expanded: {
        transform: 'rotate(180deg)',
    },
    unPinned: {
        transform: 'translateY(-3px) rotate(45deg) scale(0.85)',
    },
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

    const [wideFilters, setWideFilters] = useState(true)
    const [drawerPinned, setDrawerPinned] = useState(true)

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

    const drawerRef = useRef()
    const [drawerWidth, setDrawerWidth] = useState()

    useEffect(() => {
        if (drawerRef.current && !drawerRef.current.className) {
            setDrawerWidth(drawerRef.current.getBoundingClientRect().width)
        }
    }, [drawerRef.current])

    const drawerToolbar = (
        <Toolbar variant="dense" className={classes.drawerToolbar} disableGutters>
            <Tooltip title={drawerPinned ? 'Unpin' : 'Pin'}>
                <IconButton
                    size="small"
                    className={classes.drawerToolbarButton}
                    onClick={() => setDrawerPinned(pinned => {
                        if (!pinned) {
                            setDrawerOpenCategory(category => {
                                setTimeout(() => setDrawerOpenCategory(category), duration.leavingScreen)
                                return null
                            })
                        }
                        return !pinned
                    })}
                >
                    {drawerPinned ? (
                        cloneElement(reactIcons.pinned, { className: classes.drawerToolbarIcon})
                    ) : (
                        cloneElement(reactIcons.unpinned, { className: cn(classes.drawerToolbarIcon, classes.unPinned)})
                    )}
                </IconButton>
            </Tooltip>
        </Toolbar>
    )

    return (
        <DocumentProvider
            id={selectedDocData?.i}
            collection={selectedDocData?.c}
            collections={collections}
        >
            <HotKeys inputRef={inputRef}>
                <Grid container>
                    <Transition in={wideFilters} timeout={{
                        enter: duration.enteringScreen,
                        exit: duration.leavingScreen,
                    }}>
                        {state => (
                            <Grid
                                item
                                className={cn(classes.filters, {
                                    [classes.wideFilters]: state === 'entering' || state === 'entered'
                                })}
                            >
                                <Toolbar variant="dense" className={classes.drawerToolbar} disableGutters>
                                    <Tooltip title={wideFilters ? 'Collapse' : 'Expand'}>
                                        <IconButton
                                            size="small"
                                            className={classes.drawerToolbarButton}
                                            onClick={() => setWideFilters(toggle => !toggle)}
                                        >
                                            {cloneElement(reactIcons.doubleArrow, {
                                                className: cn(classes.drawerToolbarIcon, { [classes.expanded]: wideFilters })
                                            })}
                                        </IconButton>
                                    </Tooltip>
                                </Toolbar>

                                <CategoryDrawer
                                    key="collections"
                                    label="Collections"
                                    title="Collections"
                                    icon="categoryCollections"
                                    highlight={false}
                                    portalRef={drawerRef}
                                    width={drawerWidth}
                                    wideFilters={wideFilters}
                                    pinned={drawerPinned}
                                    toolbar={drawerToolbar}
                                    category="collections"
                                    open={drawerOpenCategory === 'collections'}
                                    onOpen={setDrawerOpenCategory}
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
                                    wideFilters={wideFilters}
                                    categories={filtersCategories}
                                    drawerOpenCategory={drawerOpenCategory}
                                    onDrawerOpen={setDrawerOpenCategory}
                                    expandedFilters={expandedFilters}
                                    onFilterExpand={setExpandedFilters}
                                    drawerWidth={drawerWidth}
                                    drawerPinned={drawerPinned}
                                    drawerToolbar={drawerToolbar}
                                    drawerPortalRef={drawerRef}
                                />
                            </Grid>
                        )}
                    </Transition>

                    <Grid item style={{ flex: 1 }}>
                        <SplitPaneLayout
                            left={
                                drawerPinned && <div ref={drawerRef} />
                            }
                            onLeftChange={size => setDrawerWidth(size)}
                            defaultSizeLeft={drawerWidth}
                            right={
                                <Document
                                    onPrev={previewPreviousDoc}
                                    onNext={previewNextDoc}
                                />
                            }
                        >
                            <div className={classes.main} ref={!drawerPinned ? drawerRef : undefined}>
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
                                                                    {cloneElement(reactIcons.cancel, { className: classes.clear })}
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
