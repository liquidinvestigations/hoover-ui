import { Grid, ListItem, Typography } from '@mui/material'
import { cloneElement, FC } from 'react'

import { reactIcons } from '../../../constants/icons'

import { useStyles } from './InsightsTitle.styles'

interface InsightsTitleProps {
    name: string
    open: boolean
    onClick: () => void
}

export const InsightsTitle: FC<InsightsTitleProps> = ({ name, open, onClick }) => {
    const { classes } = useStyles()

    return (
        <ListItem button dense onClick={onClick}>
            <Grid container className={classes.collectionTitle} justifyContent="space-between" alignItems="center" wrap="nowrap">
                <Grid item>
                    <Typography variant="h6">{name}</Typography>
                </Grid>

                {open && <Grid item>{cloneElement(reactIcons.chevronRight, { color: 'action' })}</Grid>}
            </Grid>
        </ListItem>
    )
}
