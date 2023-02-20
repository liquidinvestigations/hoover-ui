import { CircularProgress, Collapse, Fade, Grid, IconButton, ListItem, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import cn from 'classnames'
import { cloneElement, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { reactIcons } from '../constants/icons'

import ThinProgress from './search/ThinProgress'

const useStyles = makeStyles((theme) => ({
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
        },
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

function Expandable({
    title,
    loading,
    loadingETA,
    summary,
    children,
    greyed,
    defaultOpen,
    open,
    onToggle,
    resizable = false,
    fullHeight = true,
    highlight = true,
}) {
    const classes = useStyles()

    let openState = open,
        setOpenState = onToggle

    const [openInternalState, setOpenInternalState] = useState(defaultOpen || false)
    if (typeof open === 'undefined') {
        openState = openInternalState
        setOpenState = setOpenInternalState
    }

    const toggle = () => setOpenState && setOpenState(!openState)

    const contentRef = useRef()

    useEffect(() => {
        if (!fullHeight && contentRef.current) {
            contentRef.current.style.height = contentRef.current.offsetHeight + 'px'
        }
    }, [contentRef, fullHeight])

    const handleMouseMove = useCallback((event) => {
        event.preventDefault()
        contentRef.current.style.height = startHeight + event.clientY - startY + 'px'
        contentRef.current.style.maxHeight = 'none'
    }, [])

    const handleMouseUp = useCallback(
        (event) => {
            event.preventDefault()
            window.removeEventListener('mouseup', handleMouseUp)
            window.removeEventListener('mousemove', handleMouseMove)
        },
        [handleMouseMove]
    )

    const handleMouseDown = useCallback(
        (event) => {
            event.preventDefault()
            startY = event.clientY
            startHeight = contentRef.current.offsetHeight
            window.addEventListener('mouseup', handleMouseUp, { once: true })
            window.addEventListener('mousemove', handleMouseMove)
        },
        [handleMouseMove, handleMouseUp]
    )

    const headerBar = useMemo(
        () => (
            <ListItem dense button onClick={toggle} className={classes.header}>
                <Fade in={loading} unmountOnExit>
                    <div>
                        <ThinProgress eta={loadingETA} loading={loading} />
                    </div>
                </Fade>

                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Typography
                            variant="body2"
                            component="div"
                            className={classes.title}
                            color={greyed ? 'textSecondary' : highlight ? 'secondary' : 'initial'}>
                            {title}
                            {loading && <CircularProgress size={16} thickness={4} className={classes.loading} />}
                        </Typography>
                    </Grid>

                    {summary && <Grid item>{summary}</Grid>}

                    {typeof open === 'undefined' && (
                        <Grid item>
                            <IconButton
                                size="small"
                                className={cn(classes.expand, {
                                    [classes.expandOpen]: openState,
                                })}
                                onClick={toggle}
                                aria-expanded={openState}
                                aria-label="Show more">
                                {cloneElement(reactIcons.chevronDown, { color: highlight ? 'secondary' : 'action' })}
                            </IconButton>
                        </Grid>
                    )}
                </Grid>
            </ListItem>
        ),
        [
            title,
            greyed,
            highlight,
            openState,
            summary,
            loadingETA,
            open,
            toggle,
            loading,
            classes.expand,
            classes.expandOpen,
            classes.header,
            classes.loading,
            classes.title,
        ]
    )

    return (
        <>
            {headerBar}

            <Collapse in={openState} classes={{ entered: cn({ [classes.fullHeightCollapseEntered]: fullHeight }) }}>
                <div ref={contentRef} className={cn(classes.content, { [classes.fullHeightContent]: fullHeight })}>
                    {children}
                </div>

                {resizable && <div role="presentation" className={cn('Resizer horizontal')} onMouseDown={handleMouseDown} />}
            </Collapse>
        </>
    )
}

export default Expandable
