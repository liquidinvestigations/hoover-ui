import { IconButton, Toolbar, Tooltip } from '@mui/material'
import { cloneElement, FC } from 'react'

import { reactIcons } from '../../../../constants/icons'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './CategoriesToolbar.styles'

export const CategoriesToolbar: FC = () => {
    const { classes, cx } = useStyles()
    const { wideFilters, setWideFilters } = useSharedStore().searchStore.searchViewStore

    const handleCollapse = () => setWideFilters(!wideFilters)

    return (
        <Toolbar variant="dense" className={classes.toolbar} disableGutters>
            <Tooltip title={wideFilters ? 'Collapse' : 'Expand'}>
                <IconButton size="small" className={classes.collapseButton} onClick={handleCollapse}>
                    {cloneElement(reactIcons.doubleArrow, {
                        className: cx(classes.collapseIcon, { [classes.expanded]: wideFilters }),
                    })}
                </IconButton>
            </Tooltip>
        </Toolbar>
    )
}
