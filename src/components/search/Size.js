import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Grid, MenuItem, Select, Typography } from '@material-ui/core'
import { SIZE_OPTIONS } from '../../constants'

const useStyles = makeStyles(theme => ({
    label: {
        marginRight: theme.spacing(1),
    },
}))

function Size ({ size, changeSize }) {
    const classes = useStyles()
    const handleSizeChange = event => changeSize(event.target.value)

    return (
        <Grid container alignItems="center">
            <Grid item>
                <Typography variant="caption" className={classes.label}>Hits / page</Typography>
            </Grid>
            <Grid item>
                <Select autoWidth disableUnderline value={size} onChange={handleSizeChange}>
                    {SIZE_OPTIONS.map(option => (
                        <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                </Select>
            </Grid>
        </Grid>
    )
}

export default memo(Size)
