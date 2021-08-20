import React, { cloneElement } from 'react'
import cn from 'classnames'
import { IconButton, Toolbar, Tooltip } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { reactIcons } from '../../../constants/icons'

const useStyles = makeStyles(theme => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
    },
    collapseButton: {
        marginLeft: 'auto',
        marginRight: 11,
    },
    collapseIcon: {
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expanded: {
        transform: 'rotate(180deg)',
    },
}))

export default function CategoriesToolbar({ collapsed, onCollapseToggle }) {
    const classes = useStyles()
    const handleCollapse = () => onCollapseToggle(toggle => !toggle)

    return (
        <Toolbar variant="dense" className={classes.toolbar} disableGutters>
            <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
                <IconButton
                    size="small"
                    className={classes.collapseButton}
                    onClick={handleCollapse}
                >
                    {cloneElement(reactIcons.doubleArrow, {
                        className: cn(classes.collapseIcon, { [classes.expanded]: !collapsed })
                    })}
                </IconButton>
            </Tooltip>
        </Toolbar>
    )
}
