import { Fab, Menu, MenuItem } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { FC, useState, MouseEvent } from 'react'
import { Entries } from 'type-fest'

import { SORTABLE_FIELDS } from '../../../../constants/general'
import { reactIcons } from '../../../../constants/icons'
import { SearchType } from '../../../../stores/search/SearchStore'
import { defaultSearchParams } from '../../../../utils/queryUtils'
import { useSharedStore } from '../../../SharedStoreProvider'

export const SortingMenu: FC = observer(() => {
    const { t } = useTranslate()
    const { query, navigateSearch } = useSharedStore().searchStore
    const order = query?.order || []

    const sortOptions = (Object.entries(SORTABLE_FIELDS) as Entries<typeof SORTABLE_FIELDS>).filter(
        ([field]) => order.findIndex(([v]) => v === field) === -1,
    )
    const [anchorEl, setAnchorEl] = useState<Element | undefined>()
    const handleSortingMenuClick = (event: MouseEvent) => sortOptions.length && setAnchorEl(event.currentTarget)
    const handleSortingMenuClose = () => setAnchorEl(undefined)
    const handleSortingClick = (field: string) => () => {
        const index = order.findIndex(([v]) => v === field)
        if (!index || index < 0) {
            navigateSearch({ order: [[field, 'desc'], ...order], page: defaultSearchParams.page }, { searchType: SearchType.Results })
        }
    }

    return (
        <>
            <Fab size="small" color="primary" style={{ flex: 'none', boxShadow: 'none' }} onClick={handleSortingMenuClick} data-test="sort-button">
                {reactIcons.sort}
            </Fab>

            <Menu anchorEl={anchorEl} keepMounted open={!!anchorEl} onClose={handleSortingMenuClose} data-test="sort-menu">
                {sortOptions.map(([field, name]) => (
                    <MenuItem key={field} value={field} onClick={handleSortingClick(field)}>
                        {/* @tolgee-ignore */}
                        {t(field, name)}
                    </MenuItem>
                ))}
            </Menu>
        </>
    )
})
