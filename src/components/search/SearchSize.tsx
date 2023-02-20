import { Grid, MenuItem, Select, Theme, Typography } from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select/SelectInput'
import { makeStyles } from '@mui/styles'
import { FC } from 'react'

import { SIZE_OPTIONS } from '../../constants/general'
import { useSharedStore } from '../SharedStoreProvider'

const useStyles = makeStyles((theme: Theme) => ({
    label: {
        marginRight: theme.spacing(1),
    },
}))

interface SearchSizeProps {
    page: number
    size: number
}

export const SearchSize: FC<SearchSizeProps> = ({ page, size }) => {
    const classes = useStyles()
    const { search } = useSharedStore().searchStore

    const handleSizeChange = (event: SelectChangeEvent) => {
        const newSize = parseInt(event.target.value)
        if (newSize > size) {
            search({ size: newSize, page: Math.ceil((page * size) / newSize) })
        } else {
            search({ size: newSize, page: Math.floor(((page - 1) * size) / newSize) + 1 })
        }
    }

    return (
        <Grid container alignItems="center">
            <Grid item>
                <Typography variant="caption" className={classes.label}>
                    Hits / page
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
                        } as any
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
