import { Chip } from '@mui/material'
import { makeStyles } from '@mui/styles'
import cx from 'classnames'
import { memo } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd'

import { SORTABLE_FIELDS } from '../../../constants/general'
import { reactIcons } from '../../../constants/icons'
import { defaultSearchParams } from '../../../utils/queryUtils'
import { titleCase } from '../../../utils/utils'
import { useSearch } from '../SearchProvider'

const useStyles = makeStyles((theme) => ({
    icon: {
        transition: 'transform .2s ease-in-out',
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

function SortingChips() {
    const classes = useStyles()
    const { query, search } = useSearch()

    const order = query.order
    const changeOrder = (newOrder) => {
        search({ order: newOrder, page: defaultSearchParams.page })
    }

    const handleClick = (field) => () => {
        const index = order.findIndex(([v]) => v === field)
        const [, direction] = order[index]
        const newOrder = [...order]
        if (direction) {
            newOrder[index] = [field]
        } else {
            newOrder[index] = [field, 'desc']
        }
        changeOrder(newOrder)
    }

    const handleDelete = (field) => () => {
        const index = order.findIndex(([v]) => v === field)
        const newOrder = [...order]
        newOrder.splice(index, 1)
        changeOrder(newOrder)
    }

    const handleDragEnd = (result) => {
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
                {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className={classes.chips}>
                        {order?.map(([field, direction = 'asc'], index) => (
                            <Draggable key={field} draggableId={field} index={index}>
                                {(provided) => (
                                    <Chip
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        size="small"
                                        icon={reactIcons.arrowUp}
                                        label={SORTABLE_FIELDS[field] || titleCase(field)}
                                        onClick={handleClick(field)}
                                        onDelete={handleDelete(field)}
                                        classes={{
                                            icon: cx(classes.icon, {
                                                [classes.iconDown]: direction === 'desc',
                                            }),
                                        }}
                                    />
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}

export default memo(SortingChips)
