import React, { useState } from 'react'
import { Sort } from '@material-ui/icons'
import { Fab, Menu, MenuItem } from '@material-ui/core'
import { SORTABLE_FIELDS } from '../../constants'

export default function SortingMenu({ addSorting }) {
    const [anchorEl, setAnchorEl] = useState(null)
    const handleSortingMenuClick = event => setAnchorEl(event.currentTarget)
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
                {Object.entries(SORTABLE_FIELDS).map(([field, name]) => (
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
