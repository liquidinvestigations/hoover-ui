import { Grid } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { Collections } from '../Collections/Collections'
import { Filters } from '../Filters'

import { useStyles } from './Categories.styles'

export const Categories: FC = observer(() => {
    const { classes } = useStyles()

    return (
        <Grid item className={classes.container} data-test="categories">
            <Collections />
            <Filters />
        </Grid>
    )
})
