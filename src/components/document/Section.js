import React, { useState } from 'react'
import PropTypes from 'prop-types'
import cn from 'classnames'
import { Collapse, Divider, Grid, IconButton, ListItem, Typography } from '@material-ui/core'
import { ExpandMore } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'

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

Section.propTypes = {
    defaultOpen: PropTypes.bool,
    scrollX: PropTypes.bool,
}

Section.defaultProps = {
    defaultOpen: true,
    scrollX: false,
}

export default function Section({ title, children, defaultOpen, scrollX }) {
    const classes = useStyles()

    const [open, setOpen] = useState(defaultOpen || false)

    const toggle = () => setOpen(!open)

    return (
        <>
            <ListItem onClick={toggle} button dense className={classes.sectionHeader}>
                <Grid container alignItems="baseline" justify="space-between">
                    <Grid item>
                        <Typography variant="h6">
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
                            <ExpandMore color={'action'} />
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
        </>
    )
}
