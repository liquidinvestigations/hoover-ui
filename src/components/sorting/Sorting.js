import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SortingChips from './SortingChips'
import SortingMenu from './SortingMenu'

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        marginTop: theme.spacing(2),
        justifyContent: 'flex-end',
    },
}))

function Sorting({ order = [], changeOrder }) {
    const classes = useStyles()
    const handleSortingAdd = field => {
        const index = order?.findIndex(([v]) => v === field)
        if (!index || index < 0) {
            changeOrder([[field], ...order])
        }
    }

    return (
        <div className={classes.root}>
            <SortingChips order={order} changeOrder={changeOrder} />
            <SortingMenu addSorting={handleSortingAdd} />
        </div>
    )
}

export default memo(Sorting)
