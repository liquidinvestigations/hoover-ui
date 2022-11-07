import { useState } from 'react'
import { Fab, Menu, MenuItem } from '@mui/material'
import { SORTABLE_FIELDS } from '../../../constants/general'
import { useSearch } from '../SearchProvider'
import { reactIcons } from '../../../constants/icons'

export default function SortingMenu() {
    const { query, search } = useSearch()
    const order = query.order || []

    const sortOptions = Object.entries(SORTABLE_FIELDS).filter(([field]) => order.findIndex(([v]) => v === field) === -1)
    const [anchorEl, setAnchorEl] = useState(null)
    const handleSortingMenuClick = (event) => sortOptions.length && setAnchorEl(event.currentTarget)
    const handleSortingMenuClose = () => setAnchorEl(null)
    const handleSortingClick = (field) => () => {
        const index = order.findIndex(([v]) => v === field)
        if (!index || index < 0) {
            search({ order: [[field, 'desc'], ...order], page: 1 })
        }
    }

    return (
        <>
            <Fab size="small" color="primary" style={{ flex: 'none', boxShadow: 'none' }} onClick={handleSortingMenuClick} data-test="sort-button">
                {reactIcons.sort}
            </Fab>

            <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleSortingMenuClose} data-test="sort-menu">
                {sortOptions.map(([field, name]) => (
                    <MenuItem key={field} value={field} onClick={handleSortingClick(field)}>
                        {name}
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
}
