import React, { memo } from 'react'
import cn from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { Chip } from '@material-ui/core'
import { ArrowUpward } from '@material-ui/icons'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'
import { SORTABLE_FIELDS } from '../../constants'

const useStyles = makeStyles(theme => ({
    icon: {
        transition: 'transform .5s ease-in-out',
    },
    iconDown: {
        transform: 'rotate(180deg)',
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        '& > *': {
            marginRight: theme.spacing(0.5),
            marginBottom: theme.spacing(0.5),
        },
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

    const handleDragEnd = result => {
        if (result.destination) {
            const newOrder = [...order]
            const [reorderedItem] = newOrder.splice(result.source.index, 1)
            newOrder.splice(result.destination.index, 0, reorderedItem)
            changeOrder(newOrder)
        }
    }

    return (
        <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="sorting" direction="horizontal">
                {provided => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className={classes.chips}>
                        {Array.isArray(order) &&
                            order.filter(([field, direction = 'asc']) =>
                                Object.keys(SORTABLE_FIELDS).includes(field) && ['asc', 'desc'].includes(direction)
                            )
                            .map(([field, direction = 'asc'], index) =>
                                <Draggable key={field} draggableId={field} index={index}>
                                    {provided => (
                                        <Chip
                                            ref={provided.innerRef}
                                            {...provided.draggableProps}
                                            {...provided.dragHandleProps}
                                            size="small"
                                            icon={<ArrowUpward />}
                                            label={SORTABLE_FIELDS[field]}
                                            onClick={handleClick(field)}
                                            onDelete={handleDelete(field)}
                                            classes={{
                                                icon: cn(classes.icon, {
                                                    [classes.iconDown]: direction === 'desc'
                                                })
                                            }}
                                        />
                                    )}
                                </Draggable>
                            )
                        }
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}

export default memo(SortingChips)
