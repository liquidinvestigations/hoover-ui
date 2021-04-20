import React, { cloneElement, useEffect, useMemo, useState } from 'react'
import cn from 'classnames'
import { makeStyles, duration } from '@material-ui/core/styles'
import { Grid, IconButton, ListItem, Portal, Slide, Typography } from '@material-ui/core'
import { ChevronRight } from '@material-ui/icons'
import { Transition } from 'react-transition-group'

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        overflow: 'hidden',
        position: 'absolute',
        height: 'calc(100vh - 56px)',

        '@media (min-width: 0px) and (orientation: landscape)': {
            height: 'calc(100vh - 48px)',
        },

        '@media (min-width: 600px)': {
            height: 'calc(100vh - 64px)',
        }
    },

    inner: {
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        position: 'absolute',
        backgroundColor: theme.palette.background.paper,
    },

    upper: {
        textTransform: 'uppercase',
    },

    icon: {
        alignSelf: 'center',
        marginRight: theme.spacing(2),
    },

    label: {
        marginRight: 'auto',
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

export default function CategoryDrawer({ title, icon, children, open, onToggle, enabled = true, greyed = false, highlight = true }) {
    const classes = useStyles()
    const [position, setPosition] = useState({ top: 0, left: 0 })

    useEffect(() => {
        const positionElement = document.querySelector('#category-drawer')
        const position = positionElement.getBoundingClientRect()

        setPosition({
            top: position.top + 'px',
            left: position.left + 'px',
        })
    }, [])

    const toggle = () => {
        onToggle(!open)
    }

    const titleBar = useMemo(() => (
        <ListItem onClick={toggle} button dense className={classes.header}>
            <Grid container alignItems="baseline" justify="space-between">
                <Grid item className={classes.icon}>
                    {cloneElement(icon, { color: highlight ? 'secondary' : 'inherit'})}
                </Grid>

                <Grid item className={classes.label}>
                    <Typography
                        variant="body2"
                        className={classes.upper}
                        color={greyed ? 'textSecondary' : highlight ? 'secondary' : 'initial'}
                    >
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
                        aria-label="Open"
                    >
                        <ChevronRight color={highlight ? 'secondary' : 'action'} />
                    </IconButton>
                </Grid>
            </Grid>
        </ListItem>
    ), [title, greyed, highlight, open])

    if (!enabled) {
        return null
    }

    return (
        <>
            {titleBar}

            <Portal container={typeof document !== 'undefined' ? document.querySelector('#category-drawer') : undefined}>
                <Transition in={open} timeout={{
                    enter: duration.enteringScreen,
                    exit: duration.leavingScreen,
                }} mountOnEnter unmountOnExit>
                    <div /*style={position}*/ className={classes.root}>
                        <Slide direction="right" in={open}>
                            <div className={classes.inner}>
                                {children}
                            </div>
                        </Slide>
                    </div>
                </Transition>
            </Portal>
        </>
    )
}
