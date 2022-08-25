import React, { cloneElement, memo, useState } from 'react'
import cn from 'classnames'
import { makeStyles } from '@mui/styles'
import { Button, Collapse, Divider, Grid, IconButton, ListItem, Tooltip, Typography } from '@mui/material'
import { reactIcons } from '../../constants/icons'

const useStyles = makeStyles(theme => ({
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

    sectionHeader: {
        backgroundColor: theme.palette.grey[200],
        color: theme.palette.text.action,
        padding: '1rem',
    },

    toolbarButton: {
        textTransform: 'none',
        color: theme.palette.grey[600],
    },

    sectionContent: {
        margin: '1rem',
        overflowWrap: 'break-word',
        wordWrap: 'break-word',
        position: 'relative',
        // padding: '0 2rem 0 0',
        fontSize: 12,
    },

    scrollX: {
        overflowX: 'auto',
    },
}))

function Section({ title, toolbarButtons, children, defaultOpen = true, scrollX = false }) {
    const classes = useStyles()

    const [open, setOpen] = useState(defaultOpen || false)

    const toggle = () => setOpen(!open)

    return <>
        <ListItem onClick={toggle} button dense className={classes.sectionHeader}>
            <Grid container alignItems="baseline" justifyContent="space-between">
                <Grid item>
                    <Typography variant="h6">
                        {title}
                    </Typography>
                </Grid>

                {toolbarButtons && toolbarButtons.map(({tooltip, label, icon, ...props}, index) => (
                    <Grid item key={index}>
                        <Tooltip title={tooltip}>
                            <Button
                                className={classes.toolbarButton}
                                size="small"
                                component="a"
                                endIcon={icon}
                                {...props}>
                                {label}
                            </Button>
                        </Tooltip>
                    </Grid>
                ))}

                <Grid item>
                    <IconButton
                        className={cn(classes.expand, {
                            [classes.expandOpen]: open,
                        })}
                        onClick={toggle}
                        aria-expanded={open}
                        aria-label="Show more"
                        size="large">
                        {cloneElement(reactIcons.chevronDown, { color: 'action' })}
                    </IconButton>
                </Grid>
            </Grid>
        </ListItem>

        <Collapse in={open}>
            <div className={cn(classes.sectionContent, { [classes.scrollX]: scrollX })}>
                {children}
            </div>
            <Divider />
        </Collapse>
    </>;
}

export default memo(Section)
