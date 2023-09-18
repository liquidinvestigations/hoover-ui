import { IconButton, Toolbar, Tooltip } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { reactIcons } from '../../../../constants/icons'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './CategoriesToolbar.styles'

export const CategoriesToolbar: FC = observer(() => {
    const { classes } = useStyles()
    const { searchFieldsOpen, setSearchFieldsOpen } = useSharedStore().searchStore.searchViewStore

    const handleSearchFields = () => setSearchFieldsOpen(!searchFieldsOpen)

    return (
        <Toolbar variant="dense" className={classes.toolbar} disableGutters>
            <Tooltip title="Manage search fields">
                <IconButton size="small" className={classes.searchFieldsButton} onClick={handleSearchFields}>
                    {reactIcons.searchFields}
                </IconButton>
            </Tooltip>
        </Toolbar>
    )
})
