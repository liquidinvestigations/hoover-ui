import React, { useCallback, useEffect, useMemo, useState } from 'react'
import cn from 'classnames'
import { Transition } from 'react-transition-group'
import { Grid } from '@material-ui/core'
import { duration, makeStyles } from '@material-ui/core/styles'
import CategoriesToolbar from './CategoriesToolbar'
import CategoryDrawer from './CategoryDrawer'
import CategoryDrawerToolbar from './CategoryDrawerToolbar'
import CollectionsFilter from './CollectionsFilter'
import Filters from './Filters'
import { useSearch } from '../SearchProvider'
import Expandable from '../../Expandable'
import { aggregationCategories, aggregationFields } from '../../../constants/aggregationFields'
import Collections from './Collections'

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
}))

export default function Categories({ collections, openCategory, setOpenCategory,
                                       drawerRef, drawerWidth, setDrawerWidth, drawerPinned, setDrawerPinned }) {
    const classes = useStyles()

    const [searchBuckets, setSearchBuckets] = useState('')
    const [wideFilters, setWideFilters] = useState(true)

    useEffect(() => {
        if (drawerRef.current && !drawerRef.current.className) {
            setDrawerWidth(drawerRef.current.getBoundingClientRect().width)
        }
    }, [drawerRef.current])

    const drawerToolbar = (
        <CategoryDrawerToolbar
            search={searchBuckets}
            onSearch={setSearchBuckets}
            drawerPinned={drawerPinned}
            setDrawerPinned={setDrawerPinned}
            setOpenCategory={setOpenCategory}
        />
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
                    <CategoriesToolbar
                        collapsed={!wideFilters}
                        onCollapseToggle={setWideFilters}
                    />

                    <Collections
                        collections={collections}
                        openCategory={openCategory}
                        setOpenCategory={setOpenCategory}
                        wideFilters={wideFilters}
                        drawerWidth={drawerWidth}
                        drawerPinned={drawerPinned}
                        setDrawerPinned={setDrawerPinned}
                        drawerPortalRef={drawerRef}
                    />

                    <Filters
                        openCategory={openCategory}
                        setOpenCategory={setOpenCategory}
                        wideFilters={wideFilters}
                        drawerWidth={drawerWidth}
                        drawerPinned={drawerPinned}
                        setDrawerPinned={setDrawerPinned}
                        drawerPortalRef={drawerRef}
                    />
                </Grid>
            )}
        </Transition>
    )
}
