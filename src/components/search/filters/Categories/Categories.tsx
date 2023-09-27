import { Grid } from '@mui/material'
import { duration } from '@mui/material/styles'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { Transition } from 'react-transition-group'

import { useSharedStore } from '../../../SharedStoreProvider'
import { CategoriesToolbar } from '../CategoriesToolbar/CategoriesToolbar'
import { Collections } from '../Collections/Collections'
import { Filters } from '../Filters'
import { SearchFields } from '../SearchFields/SearchFields'

import { useStyles } from './Categories.styles'

export const Categories: FC = observer(() => {
    const { classes, cx } = useStyles()
    const { wideFilters } = useSharedStore().searchStore.searchViewStore

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
                    <CategoriesToolbar />
                    <SearchFields />
                    <Collections />
                    <Filters />
                </Grid>
            )}
        </Transition>
    )
})
