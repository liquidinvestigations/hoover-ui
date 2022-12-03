import { useEffect, useState } from 'react'
import cn from 'classnames'
import { Transition } from 'react-transition-group'
import { Grid } from '@mui/material'
import { duration } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import CategoriesToolbar from './CategoriesToolbar'
import Filters from './Filters'
import { Collections } from './Collections'

const useStyles = makeStyles((theme) => ({
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

export default function Categories({ openCategory, setOpenCategory, drawerRef, drawerWidth, setDrawerWidth, drawerPinned, setDrawerPinned }) {
    const classes = useStyles()
    const [wideFilters, setWideFilters] = useState(true)

    useEffect(() => {
        if (drawerRef.current && !drawerRef.current.className) {
            setDrawerWidth(drawerRef.current.getBoundingClientRect().width)
        }
    }, [drawerRef.current])

    return (
        <Transition
            in={wideFilters}
            timeout={{
                enter: duration.enteringScreen,
                exit: duration.leavingScreen,
            }}>
            {(state) => (
                <Grid
                    item
                    className={cn(classes.container, {
                        [classes.wide]: state === 'entering' || state === 'entered',
                    })}
                    data-test="categories">
                    <CategoriesToolbar collapsed={!wideFilters} onCollapseToggle={setWideFilters} />

                    <Collections
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
