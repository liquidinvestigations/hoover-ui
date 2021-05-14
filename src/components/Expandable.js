import React, { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cn from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { CircularProgress, Collapse, Grid, IconButton, ListItem, Typography } from '@material-ui/core'
import { reactIcons } from '../constants/icons'

const useStyles = makeStyles(theme => ({
    title: {
        minHeight: 32,
        textTransform: 'uppercase',
        paddingTop: 6,
        paddingBottom: 6,
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
    header: {
        backgroundColor: theme.palette.grey[100],
        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        }
    },
    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },
    content: {
        maxHeight: 435,
        overflow: 'auto',
    },
    fullHeightCollapseEntered: {
        overflow: 'auto',
    },
    fullHeightContent: {
        height: '100%',
        maxHeight: 'none',
        overflow: 'hidden',
    },
}))

let startY, startHeight

function Expandable({ title, loading, summary, children, greyed, defaultOpen, open, onToggle,
                        resizable = false, fullHeight = true, highlight = true }) {

    const classes = useStyles()

    let openState = open, setOpenState = onToggle
    if (typeof open === 'undefined') {
        const [openInternalState, setOpenInternalState] = useState(defaultOpen || false)
        openState = openInternalState
        setOpenState = setOpenInternalState
    }

    const toggle = () => setOpenState && setOpenState(!openState)

    const contentRef = useRef()

    useEffect(() => {
        if (!fullHeight && contentRef.current) {
            contentRef.current.style.height = contentRef.current.offsetHeight + 'px'
        }
    }, [contentRef])

    const handleMouseUp = useCallback(event => {
        event.preventDefault()
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('mousemove', handleMouseMove)
    }, [])

    const handleMouseMove = useCallback(event => {
        event.preventDefault()
        contentRef.current.style.height = startHeight + event.clientY - startY + 'px'
        contentRef.current.style.maxHeight = 'none'
    }, [])

    const handleMouseDown = useCallback(event => {
        event.preventDefault()
        startY = event.clientY
        startHeight = contentRef.current.offsetHeight
        window.addEventListener('mouseup', handleMouseUp, {once: true})
        window.addEventListener('mousemove', handleMouseMove)
    }, [])

    const headerBar = useMemo(() => (
        <ListItem
            dense
            button
            onClick={toggle}
            className={classes.header}
        >
            <Grid container alignItems="center" justify="space-between">
                <Grid item>
                    <Typography
                        variant="body2"
                        component="div"
                        className={classes.title}
                        color={greyed ? 'textSecondary' : highlight ? 'secondary' : 'initial'}
                    >
                        {title}
                        {loading && (
                            <CircularProgress
                                size={16}
                                thickness={4}
                                className={classes.loading}
                            />
                        )}
                    </Typography>
                </Grid>

                {summary && (
                    <Grid item>
                        {summary}
                    </Grid>
                )}

                {typeof open === 'undefined' && (
                    <Grid item>
                        <IconButton
                            size="small"
                            className={cn(classes.expand, {
                                [classes.expandOpen]: openState,
                            })}
                            onClick={toggle}
                            aria-expanded={openState}
                            aria-label="Show more"
                        >
                            {cloneElement(reactIcons.chevronDown, { color: highlight ? 'secondary' : 'action'})}
                        </IconButton>
                    </Grid>
                )}
            </Grid>
        </ListItem>
    ), [title, greyed, defaultOpen, highlight, openState, summary])

    return (
        <>
            {headerBar}

            <Collapse
                in={openState}
                classes={{ entered: cn({ [classes.fullHeightCollapseEntered]: fullHeight }) }}
            >
                <div
                    ref={contentRef}
                    className={cn(classes.content, { [classes.fullHeightContent]: fullHeight })}
                >
                    {children}
                </div>

                {resizable && (
                    <div
                        role="presentation"
                        className={cn('Resizer horizontal')}
                        onMouseDown={handleMouseDown}
                    />
                )}
            </Collapse>
        </>
    )
}

export default Expandable
