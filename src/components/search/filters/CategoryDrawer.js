import React, { cloneElement, useEffect, useMemo, useState } from 'react'
import cn from 'classnames'
import { Transition } from 'react-transition-group'
import { makeStyles, duration } from '@material-ui/core/styles'
import { Grid, ListItem, Portal, Slide, Typography } from '@material-ui/core'
import { ChevronRight } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    root: {
        width: '100%',
        overflow: 'hidden',
        position: 'absolute',
        height: 'calc(100vh - 56px - 48px)',

        '@media (min-width: 0px) and (orientation: landscape)': {
            height: 'calc(100vh - 48px - 48px)',
        },

        '@media (min-width: 600px)': {
            height: 'calc(100vh - 64px - 48px)',
        }
    },
    inner: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
    },
    title: {
        minHeight: 32,
        textTransform: 'uppercase',
        paddingTop: 6,
        paddingBottom: 6,
    },
    bold: {
        fontWeight: 'bold',
    },
    icon: {
        display: 'flex',
        alignSelf: 'center',
        marginRight: theme.spacing(2),
    },
    label: {
        marginRight: 'auto',
    },
    open: {
        display: 'flex',
        alignSelf: 'center',
        marginLeft: theme.spacing(1),
        [theme.breakpoints.up('sm')]: {
            marginRight: -8,
        },
    },
    openCollapsed: {
        borderRight: `3px solid ${theme.palette.grey[700]}`,
    },
}))

export default function CategoryDrawer({ title, icon, children, wideFilters, open, onOpen,
                                           enabled = true, greyed = false, highlight = true }) {
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

    const titleBar = useMemo(() => (
        <ListItem
            dense
            button
            onClick={() => onOpen()}
            className={cn({ [classes.openCollapsed]: !wideFilters && open })}
        >
            <Grid
                container
                alignItems="baseline"
                justify="space-between"
                wrap="nowrap"
            >
                <Grid item className={classes.icon}>
                    {cloneElement(icon, { color: highlight ? 'secondary' : 'inherit'})}
                </Grid>

                <Grid item className={classes.label}>
                    <Typography
                        noWrap
                        variant="body2"
                        component="div"
                        className={cn(classes.title, { [classes.bold]: open })}
                        color={greyed ? 'textSecondary' : highlight ? 'secondary' : 'initial'}
                    >
                        {title}
                    </Typography>
                </Grid>

                {open && (
                    <Grid item className={classes.open} >
                        <ChevronRight color={highlight ? 'secondary' : 'action'} />
                    </Grid>
                )}
            </Grid>
        </ListItem>
    ), [title, greyed, highlight, wideFilters, open])

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
