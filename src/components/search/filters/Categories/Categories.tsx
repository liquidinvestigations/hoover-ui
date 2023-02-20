import { Grid } from '@mui/material'
import { duration } from '@mui/material/styles'
import cx from 'classnames'
import { FC, RefObject, useEffect, useState } from 'react'
import { Transition } from 'react-transition-group'

import { CategoriesToolbar } from '../CategoriesToolbar/CategoriesToolbar'
import { Collections } from '../Collections/Collections'
import Filters from '../Filters'

import { useStyles } from './Categories.styles'

interface CategoriesProps {
    drawerWidth: number
    drawerRef: RefObject<HTMLDivElement>
    setDrawerWidth: (width: number) => void
}

export const Categories: FC<CategoriesProps> = ({ drawerRef, drawerWidth, setDrawerWidth }) => {
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
