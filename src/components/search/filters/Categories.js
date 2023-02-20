import { Grid } from '@mui/material'
import { duration } from '@mui/material/styles'
import { makeStyles } from '@mui/styles'
import cx from 'classnames'
import { useEffect, useState } from 'react'
import { Transition } from 'react-transition-group'

import CategoriesToolbar from './CategoriesToolbar'
import { Collections } from './Collections'
import Filters from './Filters'

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

export default function Categories({ drawerRef, drawerWidth, setDrawerWidth }) {
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
                    className={cx(classes.container, {
                        [classes.wide]: state === 'entering' || state === 'entered',
                    })}
                    data-test="categories">
                    <CategoriesToolbar collapsed={!wideFilters} onCollapseToggle={setWideFilters} />

                    <Collections wideFilters={wideFilters} drawerWidth={drawerWidth} drawerPortalRef={drawerRef} />

                    <Filters wideFilters={wideFilters} drawerWidth={drawerWidth} drawerPortalRef={drawerRef} />
                </Grid>
            )}
        </Transition>
    )
}
