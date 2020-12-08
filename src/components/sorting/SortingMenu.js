import React, { useState } from 'react'
import { Sort } from '@material-ui/icons'
import { Fab, Menu, MenuItem } from '@material-ui/core'
import { SORTABLE_FIELDS } from '../../constants'

export default function SortingMenu({ order, addSorting }) {
    const sortOptions = Object.entries(SORTABLE_FIELDS).filter(
        ([field]) => order.findIndex(([v]) => v === field) === -1
    )
    const [anchorEl, setAnchorEl] = useState(null)
    const handleSortingMenuClick = event => sortOptions.length && setAnchorEl(event.currentTarget)
    const handleSortingMenuClose = () => setAnchorEl(null)
    const handleSortingClick = field => () => addSorting(field)

    return (
        <>
            <Fab
                size="small"
                color="primary"
                style={{ flex: 'none', boxShadow: 'none' }}
                onClick={handleSortingMenuClick}
            >
                <Sort />
            </Fab>

            <Menu
                anchorEl={anchorEl}
                keepMounted
                open={Boolean(anchorEl)}
                onClose={handleSortingMenuClose}
            >
                {sortOptions.map(([field, name]) => (
                    <MenuItem
                        key={field}
                        value={field}
                        onClick={handleSortingClick(field)}
                    >
                        {name}
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}
