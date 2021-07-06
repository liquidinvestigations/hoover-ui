import React, { cloneElement } from 'react'
import cn from 'classnames'
import { Grid, IconButton, ListItem, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { reactIcons } from '../../constants/icons'

const useStyles = makeStyles(theme => ({
    expand: {
        marginLeft: theme.spacing(2),
        transform: 'rotate(90deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(0deg)',
    },
    collectionTitle: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}))

export default function InsightsTitle({ name, open, onToggle }) {
    const classes = useStyles()

    return (
        <ListItem
            button
            dense
            onClick={onToggle}
        >
            <Grid container
                  className={classes.collectionTitle}
                  justify="space-between"
                  alignItems="center"
                  wrap="nowrap"
            >
                <Grid item>
                    <Typography variant="h6">
                        {name}
                    </Typography>
                </Grid>
                <Grid item>
                    <IconButton
                        size="small"
                        className={cn(classes.expand, { [classes.expandOpen]: open })}
                        aria-expanded={open}
                        aria-label="Show histogram"
                    >
                        {cloneElement(reactIcons.chevronDown, { color: 'action' })}
                    </IconButton>
                </Grid>
            </Grid>
        </ListItem>
    )
}
