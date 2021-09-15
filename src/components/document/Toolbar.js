import React from 'react'
import { Badge, Box, IconButton, Toolbar as MuiToolbar, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        justifyContent: 'space-between',
    },
    toolbarIcon: {
        marginRight: theme.spacing(1),
        '&:last-child': {
            marginRight: 0,
        }
    },
}))

export default function Toolbar({ links }) {
    const classes = useStyles()

    return (
        <MuiToolbar variant="dense" classes={{root: classes.toolbar}}>
            {Object.entries(links).map(([group, links]) => (
                <Box key={group}>
                    {links.map(({tooltip, icon, count, ...props}, index) => (
                        <Tooltip title={tooltip} key={index}>
                            <IconButton
                                size="small"
                                component="a"
                                className={classes.toolbarIcon}
                                {...props}>
                                <Badge badgeContent={count} color="secondary">
                                    {icon}
                                </Badge>
                            </IconButton>
                        </Tooltip>
                    ))}
                </Box>
            ))}
        </MuiToolbar>
    )
}
