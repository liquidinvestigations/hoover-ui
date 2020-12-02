import React, { memo } from 'react'
import cn from 'classnames'
import { Chip } from '@material-ui/core'
import { ArrowDownward } from '@material-ui/icons'
import { SORTABLE_FIELDS } from '../../constants'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    icon: {
        transition: 'transform .5s ease-in-out',
    },
    iconUp: {
        transform: 'rotate(180deg)',
    },
}))

function SortingChips({ order, changeOrder }) {
    const classes = useStyles()

    const handleClick = field => () => {
        const index = order.findIndex(([v]) => v === field)
        const [,direction] = order[index]
        const newOrder = [...order]
        if (direction) {
            newOrder[index] = [field]
        } else {
            newOrder[index] = [field, 'desc']
        }
        changeOrder(newOrder)
    }

    const handleDelete = field => () => {
        const index = order.findIndex(([v]) => v === field)
        const newOrder = [...order]
        newOrder.splice(index, 1)
        changeOrder(newOrder)
    }

    return (
        <>
            {Array.isArray(order) &&
                order.filter(([field, direction = 'asc']) =>
                    SORTABLE_FIELDS.includes(field) && ['asc', 'desc'].includes(direction)
                )
                .map(([field, direction = 'asc']) =>
                    <Chip
                        key={field}
                        icon={<ArrowDownward />}
                        label={field}
                        onClick={handleClick(field)}
                        onDelete={handleDelete(field)}
                        classes={{ icon: cn(classes.icon, { [classes.iconUp]: direction === 'desc' }) }}
                    />
                )
            }
            <Chip icon={<ArrowDownward />} label={'relevance'} />
        </>
    )
}

export default memo(SortingChips)
