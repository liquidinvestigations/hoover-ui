import React, { useState } from 'react'
import { ButtonBase, CircularProgress, List, ListItem, ListItemIcon } from '@mui/material'
import { makeStyles } from '@mui/styles'
import FinderItem from './FinderItem'
import { useDocument } from '../DocumentProvider'
import { doc as docAPI } from '../../../backend/api'
import { reactIcons } from '../../../constants/icons'

const useStyles = makeStyles(theme => ({
    column: {
        backgroundColor: '#fff',
        borderRight: '1px solid #d3d3d3',
        minWidth: 200,
        overflowY: 'auto',
    }
}))

export default function FinderColumn({ items, pathname, prevPage, nextPage, active, selected }) {
    const classes = useStyles()
    const { collection } = useDocument()

    const [itemsState, setItemsState] = useState(items)
    const [prevPageState, setPrevPageState] = useState(prevPage)
    const [nextPageState, setNextPageState] = useState(nextPage)

    const [prevPageLoading, setPrevPageLoading] = useState(false)
    const [nextPageLoading, setNextPageLoading] = useState(false)

    const handlePrevPage = async () => {
        setPrevPageLoading(true)
        const prevItems = await docAPI(pathname, prevPage)
        setPrevPageLoading(false)
        setPrevPageState(prevItems.children_page > 1 ? prevItems.children_page - 1 : null)
        setItemsState(currentItems => [...prevItems.children, ...currentItems])
    }

    const handleNextPage = async () => {
        setNextPageLoading(true)
        const nextItems = await docAPI(pathname, nextPage)
        setNextPageLoading(false)
        setNextPageState(nextItems.children_has_next_page ? nextItems.children_page + 1 : null)
        setItemsState(currentItems => [...currentItems, ...nextItems.children])
    }

    return (
        <List dense disablePadding className={classes.column}>
            {prevPageState && (
                <ListItem
                    component={ButtonBase}
                    onClick={prevPageLoading ? null : handlePrevPage}
                >
                    {prevPageLoading ?
                        <CircularProgress
                            size={18}
                            thickness={5}
                            className={classes.loading}
                        />
                        :
                        <ListItemIcon>
                            {reactIcons.moreFiles}
                        </ListItemIcon>
                    }
                </ListItem>
            )}

            {itemsState.map(item => (
                <FinderItem
                    key={item.id}
                    item={item}
                    active={active}
                    selected={selected}
                />
            ))}

            {nextPageState && (
                <ListItem
                    component={ButtonBase}
                    onClick={nextPageLoading ? null : handleNextPage}
                >
                    {nextPageLoading ?
                        <CircularProgress
                            size={18}
                            thickness={5}
                            className={classes.loading}
                        />
                        :
                        <ListItemIcon>
                            {reactIcons.moreFiles}
                        </ListItemIcon>
                    }
                </ListItem>
            )}
        </List>
    )
}
