import React, { memo, useEffect, useState } from 'react'
import cn from 'classnames';
import { makeStyles } from '@material-ui/core/styles'
import { Collapse, Divider, Grid, IconButton, ListItem, Typography } from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    upper: {
        textTransform: 'uppercase',
    },

    expand: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
        marginLeft: 'auto',
        [theme.breakpoints.up('sm')]: {
            marginRight: -8,
        },
    },

    expandOpen: {
        transform: 'rotate(180deg)',
    },
}))

function Filter({ title, children, defaultOpen, enabled = true, colorIfFiltered = true }) {
    if (!enabled) {
        return null
    }

    const classes = useStyles()

    const [open, setOpen] = useState(defaultOpen || false)
    const toggle = () => setOpen(!open)

    useEffect(() => {
        setOpen(defaultOpen)
    }, [defaultOpen])

    return (
        <>
            <ListItem onClick={toggle} button dense>
                <Grid container alignItems="baseline" justify="space-between">
                    <Grid item>
                        <Typography
                            variant="body2"
                            className={classes.upper}
                            color={
                                defaultOpen && colorIfFiltered
                                    ? 'secondary'
                                    : 'initial'
                            }>
                            {title}
                        </Typography>
                    </Grid>

                    <Grid item>
                        <IconButton
                            className={cn(classes.expand, {
                                [classes.expandOpen]: open,
                            })}
                            onClick={toggle}
                            aria-expanded={open}
                            aria-label="Show more">
                            <ExpandMore
                                color={
                                    defaultOpen && colorIfFiltered
                                        ? 'secondary'
                                        : 'action'
                                }
                            />
                        </IconButton>
                    </Grid>
                </Grid>
            </ListItem>

            <Collapse in={open}>
                {children}
                <Divider />
            </Collapse>
        </>
    )
}

export default memo(Filter)
