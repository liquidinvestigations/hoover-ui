import { Chip } from '@mui/material'
import { useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { DragDropContext, Draggable, Droppable, DropResult } from 'react-beautiful-dnd'

import { reactIcons } from '../../../../constants/icons'
import { defaultSearchParams } from '../../../../utils/queryUtils'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './SortingChips.styles'

export const SortingChips: FC = observer(() => {
    const { t } = useTranslate()
    const { classes, cx } = useStyles()
    const { query, navigateSearch } = useSharedStore().searchStore

    const order = query?.order || []
    const changeOrder = (newOrder: string[][]) => {
        navigateSearch({ order: newOrder, page: defaultSearchParams.page })
    }

    const handleClick = (field: string) => () => {
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

    const handleDelete = (field: string) => () => {
        const index = order.findIndex(([v]) => v === field)
        const newOrder = [...order]
        newOrder.splice(index, 1)
        changeOrder(newOrder)
    }

    const handleDragEnd = (result: DropResult) => {
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
                {(droppableProvided) => (
                    <div {...droppableProvided.droppableProps} ref={droppableProvided.innerRef} className={classes.chips}>
                        {order?.map(([field, direction = 'asc'], index) => (
                            <Draggable key={field} draggableId={field} index={index}>
                                {(draggableProvided) => (
                                    <Chip
                                        ref={draggableProvided.innerRef}
                                        {...draggableProvided.draggableProps}
                                        {...draggableProvided.dragHandleProps}
                                        size="small"
                                        icon={reactIcons.arrowUp}
                                        /* @tolgee-ignore */
                                        label={t(field)}
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
                        {droppableProvided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
})
