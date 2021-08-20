import React, { cloneElement, useCallback, useEffect, useMemo, useState } from 'react'
import cn from 'classnames'
import { Transition } from 'react-transition-group'
import { Grid, IconButton, Toolbar, Tooltip } from '@material-ui/core'
import { duration, makeStyles } from '@material-ui/core/styles'
import CategoryToolbar from './CategoryToolbar'
import CategoryDrawer from './CategoryDrawer'
import CollectionsFilter from './CollectionsFilter'
import Filters from './Filters'
import { useSearch } from '../SearchProvider'
import Expandable from '../../Expandable'
import { reactIcons } from '../../../constants/icons'
import { aggregationCategories, aggregationFields } from '../../../constants/aggregationFields'

const useStyles = makeStyles(theme => ({
    container: {
        width: 55,
        borderRight: '1px solid rgba(0, 0, 0, 0.2)',
        transition: theme.transitions.create('width', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    wide: {
        width: 210,
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
    drawerUnPinned: {
        transform: 'translateY(-3px) rotate(45deg) scale(0.85)',
    },
}))

export default function Categories({ collections, openCategory, setOpenCategory,
                                       drawerRef, drawerWidth, setDrawerWidth, drawerPinned, setDrawerPinned }) {
    const classes = useStyles()
    const { aggregations, query, search, collectionsCount } = useSearch()
    const [wideFilters, setWideFilters] = useState(true)

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
                            setOpenCategory(category => {
                                setTimeout(() => setOpenCategory(category), duration.leavingScreen)
                                return null
                            })
                        }
                        return !pinned
                    })}
                >
                    {drawerPinned ? (
                        cloneElement(reactIcons.pinned, { className: classes.drawerToolbarIcon})
                    ) : (
                        cloneElement(reactIcons.unpinned, { className: cn(classes.drawerToolbarIcon, classes.drawerUnPinned)})
                    )}
                </IconButton>
            </Tooltip>
        </Toolbar>
    )

    return (
        <Transition in={wideFilters} timeout={{
            enter: duration.enteringScreen,
            exit: duration.leavingScreen,
        }}>
            {state => (
                <Grid
                    item
                    className={cn(classes.container, {
                        [classes.wide]: state === 'entering' || state === 'entered'
                    })}
                    data-test="categories"
                >
                    <CategoryToolbar collapsed={!wideFilters} onCollapseToggle={setWideFilters} />

                    <CategoryDrawer
                        key="collections"
                        title="Collections"
                        icon="categoryCollections"
                        highlight={false}
                        portalRef={drawerRef}
                        width={drawerWidth}
                        wideFilters={wideFilters}
                        pinned={drawerPinned}
                        toolbar={drawerToolbar}
                        category="collections"
                        open={openCategory === 'collections'}
                        onOpen={setOpenCategory}
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
                        openCategory={openCategory}
                        onDrawerOpen={setOpenCategory}
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
    )
}
