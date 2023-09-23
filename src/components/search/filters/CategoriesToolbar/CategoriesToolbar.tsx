import { IconButton, Toolbar, Tooltip } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC } from 'react'

import { reactIcons } from '../../../../constants/icons'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './CategoriesToolbar.styles'

export const CategoriesToolbar: FC = observer(() => {
    const { classes, cx } = useStyles()
    const { wideFilters, setWideFilters, searchFieldsOpen, setSearchFieldsOpen } = useSharedStore().searchStore.searchViewStore

    const handleCollapse = () => setWideFilters(!wideFilters)
    const handleSearchFields = () => setSearchFieldsOpen(!searchFieldsOpen)

    return (
        <Toolbar variant="dense" className={classes.toolbar} disableGutters>
            <Tooltip title="Manage search fields">
                <IconButton size="small" className={classes.searchFieldsButton} onClick={handleSearchFields}>
                    {reactIcons.searchFields}
                </IconButton>
            </Tooltip>

            <Tooltip title={wideFilters ? 'Collapse' : 'Expand'}>
                <IconButton size="small" className={cx(classes.collapseButton, { [classes.hidden]: searchFieldsOpen })} onClick={handleCollapse}>
                    {cloneElement(reactIcons.doubleArrow, {
                        className: cx(classes.collapseIcon, { [classes.expanded]: wideFilters }),
                    })}
                </IconButton>
            </Tooltip>
        </Toolbar>
    )
})
