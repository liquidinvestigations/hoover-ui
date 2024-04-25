import { Grid, MenuItem, MenuProps, Select, Theme, Typography } from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select/SelectInput'
import { T } from '@tolgee/react'
import { FC } from 'react'
import { makeStyles } from 'tss-react/mui'

import { SIZE_OPTIONS } from '../../constants/general'
import { SearchType } from '../../stores/search/SearchStore'
import { useSharedStore } from '../SharedStoreProvider'

const useStyles = makeStyles()((theme: Theme) => ({
    label: {
        marginRight: theme.spacing(1),
    },
}))

interface SearchSizeProps {
    page: number
    size: number
}

export const SearchSize: FC<SearchSizeProps> = ({ page, size }) => {
    const { classes } = useStyles()
    const { navigateSearch } = useSharedStore().searchStore

    const handleSizeChange = (event: SelectChangeEvent) => {
        const newSize = parseInt(event.target.value)
        if (newSize > size) {
            navigateSearch({ size: newSize, page: Math.ceil((page * size) / newSize) }, { searchType: SearchType.Results })
        } else {
            navigateSearch({ size: newSize, page: Math.floor(((page - 1) * size) / newSize) + 1 }, { searchType: SearchType.Results })
        }
    }

    return (
        <Grid container alignItems="center">
            <Grid item>
                <Typography variant="caption" className={classes.label}>
                    <T keyName="hits_per_page">Hits / page</T>
                </Typography>
            </Grid>
            <Grid item>
                <Select
                    variant="standard"
                    autoWidth
                    disableUnderline
                    value={size.toString()}
                    onChange={handleSizeChange}
                    MenuProps={
                        {
                            'data-test': 'size-menu',
                        } as Partial<MenuProps>
                    }>
                    {SIZE_OPTIONS.map((option) => (
                        <MenuItem key={option} value={option}>
                            {option}
                        </MenuItem>
                    ))}
                </Select>
            </Grid>
        </Grid>
    )
}
