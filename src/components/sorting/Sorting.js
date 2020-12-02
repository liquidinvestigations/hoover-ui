import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import SortingChips from './SortingChips'
import SortingMenu from './SortingMenu'

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        marginTop: theme.spacing(2),
        justifyContent: 'space-between',
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
        '& > *': {
            marginRight: theme.spacing(0.5),
            marginBottom: theme.spacing(0.5),
        },
    }
}))

function Sorting({ order = [], changeOrder }) {
    const classes = useStyles()
    const handleSortingAdd = field => {
        const index = order?.findIndex(([v]) => v === field)
        if (!index || index < 0) {
            changeOrder([...order, [field]])
        }
    }

    return (
        <div className={classes.root}>
            <div className={classes.chips}>
                <SortingChips order={order} changeOrder={changeOrder} />
            </div>
            <SortingMenu addSorting={handleSortingAdd} />
        </div>
    )
}

export default memo(Sorting)
