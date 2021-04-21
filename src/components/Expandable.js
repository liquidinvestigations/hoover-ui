import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import cn from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { Collapse, Grid, IconButton, ListItem, Typography } from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    title: {
        minHeight: 30,
        textTransform: 'uppercase',
        paddingTop: theme.spacing(.5),
        paddingBottom: theme.spacing(.5),
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
        backgroundColor: theme.palette.grey[100]
    },
    content: {
        maxHeight: 435,
        overflow: 'auto',
    },
    fullHeight: {
        height: '100%',
        maxHeight: 'none',
    },
}))

let startY, startHeight

function Expandable({ title, children, greyed, defaultOpen, open, onToggle, resizable = false,
                        fullHeight = true, enabled = true, highlight = true }) {

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
            className={classes.header}
            button={!!setOpenState}
            onClick={!!setOpenState ? toggle : null}
        >
            <Grid container alignItems="baseline" justify="space-between">
                <Grid item>
                    <Typography
                        variant="body2"
                        className={classes.title}
                        color={greyed ? 'textSecondary' : highlight ? 'secondary' : 'initial'}>
                        {title}
                    </Typography>
                </Grid>

                {!!setOpenState && (
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
                            <ExpandMore color={highlight ? 'secondary' : 'action'} />
                        </IconButton>
                    </Grid>
                )}
            </Grid>
        </ListItem>
    ), [title, greyed, defaultOpen, highlight, openState])

    if (!enabled) {
        return null
    }

    return (
        <>
            {headerBar}

            <Collapse in={openState}>
                <div
                    ref={contentRef}
                    className={cn(classes.content, { [classes.fullHeight]: fullHeight })}
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
