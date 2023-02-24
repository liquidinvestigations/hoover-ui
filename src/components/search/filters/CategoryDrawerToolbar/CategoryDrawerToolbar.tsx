import { IconButton, InputAdornment, TextField, Toolbar, Tooltip } from '@mui/material'
import { duration } from '@mui/material/styles'
import { observer } from 'mobx-react-lite'
import { ChangeEvent, cloneElement, FC } from 'react'

import { reactIcons } from '../../../../constants/icons'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './CategoryDrawerToolbar.styles'

import type { Category } from '../../../../Types'

export const CategoryDrawerToolbar: FC<{ category: Category }> = observer(({ category }) => {
    const { classes, cx } = useStyles()
    const { drawerPinned, setDrawerPinned, openCategory, setOpenCategory, categoryQuickFilter, setCategoryQuickFilter } =
        useSharedStore().searchStore.searchViewStore

    const handleSearch = (event: ChangeEvent<HTMLInputElement>) => setCategoryQuickFilter(category, event.target.value)
    const handleSearchDelete = () => setCategoryQuickFilter(category, '')

    const handlePinButton = () => {
        if (!drawerPinned) {
            setOpenCategory(undefined)
            setTimeout(() => setOpenCategory(openCategory), duration.leavingScreen)
        }
        setDrawerPinned(!drawerPinned)
    }

    return (
        <Toolbar variant="dense" className={classes.toolbar} disableGutters>
            <TextField
                fullWidth
                size="small"
                variant="outlined"
                placeholder="Quick filter"
                className={classes.search}
                onChange={handleSearch}
                value={categoryQuickFilter[category]}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            {cloneElement(reactIcons.search, {
                                className: classes.searchIcon,
                            })}
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton size="small" onClick={handleSearchDelete}>
                                {cloneElement(reactIcons.cancel, {
                                    className: classes.searchIcon,
                                })}
                            </IconButton>
                        </InputAdornment>
                    ),
                    classes: {
                        input: classes.searchInput,
                        adornedStart: classes.searchInputStart,
                        adornedEnd: classes.searchInputEnd,
                    },
                }}
            />
            <Tooltip title={drawerPinned ? 'Unpin' : 'Pin'}>
                <IconButton size="small" className={classes.pinButton} onClick={handlePinButton}>
                    {drawerPinned
                        ? cloneElement(reactIcons.pinned, { className: classes.pinIcon })
                        : cloneElement(reactIcons.unpinned, { className: cx(classes.pinIcon, classes.unPinned) })}
                </IconButton>
            </Tooltip>
        </Toolbar>
    )
})
