import React, { useEffect, useMemo, useRef, useState } from 'react'
import cn from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { Collapse, Divider, Grid, IconButton, ListItem, Typography } from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    upper: {
        textTransform: 'uppercase',
    },
    expand: {
        transform: 'rotate(90deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
        marginLeft: 'auto',
        [theme.breakpoints.up('sm')]: {
            marginRight: -8,
        },
    },
    expandOpen: {
        transform: 'rotate(0deg)',
    },
    header: {
        backgroundColor: theme.palette.grey[100]
    },
    content: {
        maxHeight: 435,
        overflow: 'auto',
    },
}))

let startY, startHeight

function Expandable({ title, children, defaultOpen, enabled = true, highlight = true }) {
    const classes = useStyles()
    const [open, setOpen] = useState(defaultOpen || false)
    const toggle = () => setOpen(!open)

    const contentRef = useRef()

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.style.height = contentRef.current.offsetHeight + 'px'
        }
    }, [contentRef])

    const handleMouseUp = event => {
        event.preventDefault()
        window.removeEventListener('mouseup', handleMouseUp)
        window.removeEventListener('mousemove', handleMouseMove)
    }
    const handleMouseMove = event => {
        event.preventDefault()
        contentRef.current.style.height = startHeight + event.clientY - startY + 'px'
        contentRef.current.style.maxHeight = 'none'
    }
    const handleMouseDown = event => {
        event.preventDefault()
        startY = event.clientY
        startHeight = contentRef.current.offsetHeight
        window.addEventListener('mouseup', handleMouseUp, {once: true})
        window.addEventListener('mousemove', handleMouseMove)
    }

    const headerBar = useMemo(() => (
        <ListItem onClick={toggle} button dense className={classes.header}>
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

    if (!enabled) {
        return null
    }

    return (
        <>
            {headerBar}

            <Collapse in={open}>
                <div
                    ref={contentRef}
                    className={classes.content}
                >
                    {children}
                </div>

                <div
                    role="presentation"
                    className={cn('Resizer horizontal')}
                    onMouseDown={handleMouseDown}
                />
            </Collapse>
        </>
    )
}

export default Expandable
