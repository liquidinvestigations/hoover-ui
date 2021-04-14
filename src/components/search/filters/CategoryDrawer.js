import React, { useMemo, useState } from 'react'
import cn from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { Grid, IconButton, ListItem, Slide, Typography } from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    root: {
        width: 150,
        maxWidth: 400,
        backgroundColor: theme.palette.background.paper
    }
}))

export default function CategoryDrawer({ title, children, defaultOpen, enabled = true, highlight = true }) {
    const classes = useStyles()
    const [open, setOpen] = useState(defaultOpen || false)
    const toggle = () => setOpen(!open)

    const titleBar = useMemo(() => (
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
                        aria-label="Open"
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
            {titleBar}

            <Slide direction="right" in={open} mountOnEnter unmountOnExit>
                <div className={classes.root}>
                    {children}
                </div>
            </Slide>
        </>
    )
}
