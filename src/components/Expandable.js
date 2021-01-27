import React, { useMemo, useState } from 'react'
import cn from 'classnames';
import { makeStyles } from '@material-ui/core/styles'
import { Collapse, Grid, IconButton, ListItem, Typography } from '@material-ui/core'
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

function Expandable({ title, children, defaultOpen, enabled = true, highlight = true }) {

    if (!enabled) {
        return null
    }

    const classes = useStyles()
    const [open, setOpen] = useState(defaultOpen || false)
    const toggle = () => setOpen(!open)

    const headerBar = useMemo(() => (
        <ListItem onClick={toggle} button dense>
            <Grid container alignItems="baseline" justify="space-between">
                <Grid item>
                    <Typography
                        variant="body2"
                        className={classes.upper}
                        color={
                            defaultOpen && highlight
                                ? 'secondary'
                                : 'initial'
                        }>
                        {title}
                    </Typography>
                </Grid>

                <Grid item>
                    <IconButton
                        size="small"
                        className={cn(classes.expand, {
                            [classes.expandOpen]: open,
                        })}
                        onClick={toggle}
                        aria-expanded={open}
                        aria-label="Show more"
                    >
                        <ExpandMore
                            color={
                                defaultOpen && highlight
                                    ? 'secondary'
                                    : 'action'
                            }
                        />
                    </IconButton>
                </Grid>
            </Grid>
        </ListItem>
    ), [title, defaultOpen, highlight, open])

    return (
        <>
            {headerBar}

            <Collapse in={open}>
                {children}
            </Collapse>
        </>
    )
}

export default Expandable
