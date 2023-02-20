import { IconButton, Toolbar, Tooltip } from '@mui/material'
import cx from 'classnames'
import { cloneElement, FC } from 'react'

import { reactIcons } from '../../../../constants/icons'

import { useStyles } from './CategoriesToolbar.styles'

interface CategoriesToolbarProps {
    collapsed: boolean
    onCollapseToggle: (state: (state: boolean) => boolean) => void
}

export const CategoriesToolbar: FC<CategoriesToolbarProps> = ({ collapsed, onCollapseToggle }) => {
    const classes = useStyles()
    const handleCollapse = () => onCollapseToggle((toggle: boolean) => !toggle)

    return (
        <Toolbar variant="dense" className={classes.toolbar} disableGutters>
            <Tooltip title={collapsed ? 'Expand' : 'Collapse'}>
                <IconButton size="small" className={classes.collapseButton} onClick={handleCollapse}>
                    {cloneElement(reactIcons.doubleArrow, {
                        className: cx(classes.collapseIcon, { [classes.expanded]: !collapsed }),
                    })}
                </IconButton>
            </Tooltip>
        </Toolbar>
    )
}
