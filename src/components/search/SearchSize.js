import { memo } from 'react'
import { makeStyles } from '@mui/styles'
import { Grid, MenuItem, Select, Typography } from '@mui/material'
import { SIZE_OPTIONS } from '../../constants/general'
import { useSearch } from './SearchProvider'

const useStyles = makeStyles((theme) => ({
    label: {
        marginRight: theme.spacing(1),
    },
}))

function SearchSize({ page, size }) {
    const classes = useStyles()
    const { search } = useSearch()
    const handleSizeChange = (event) => {
        const newSize = event.target.value
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
                    value={size}
                    onChange={handleSizeChange}
                    MenuProps={{
                        'data-test': 'size-menu',
                    }}>
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

export default memo(SearchSize)
