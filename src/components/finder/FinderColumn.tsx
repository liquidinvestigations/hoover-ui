import { ButtonBase, CircularProgress, List, ListItem, ListItemIcon, lighten } from '@mui/material'
import { FC, useState } from 'react'
import { makeStyles } from 'tss-react/mui'

import { doc as docAPI } from '../../backend/api'
import { reactIcons } from '../../constants/icons'
import { ChildDocument, DocumentData } from '../../Types'
import { Loading } from '../common/Loading/Loading'

import { FinderItem } from './FinderItem'
import { ColumnItem, LocalDocumentData } from './Types'

const useStyles = makeStyles()(() => ({
    column: {
        backgroundColor: '#fff',
        borderRight: '1px solid #d3d3d3',
        minWidth: 200,
        overflowY: 'auto',
        '& .MuiListItem-root': {
            '&:hover': {
                backgroundColor: lighten('#dedede', 0.5),
            },
        },
    },
}))

interface FinderColumnProps extends ColumnItem {
    active?: LocalDocumentData
}

export const FinderColumn: FC<FinderColumnProps> = ({ items, pathname, prevPage, nextPage, active, selected }) => {
    const { classes } = useStyles()

    const [itemsState, setItemsState] = useState(items as ChildDocument[])
    const [prevPageState, setPrevPageState] = useState(prevPage)
    const [nextPageState, setNextPageState] = useState(nextPage)

    const [prevPageLoading, setPrevPageLoading] = useState(false)
    const [nextPageLoading, setNextPageLoading] = useState(false)

    const handlePrevPage = async () => {
        setPrevPageLoading(true)
        const prevItems = await docAPI(pathname, prevPage)
        setPrevPageLoading(false)
        setPrevPageState(prevItems.children_page > 1 ? prevItems.children_page - 1 : undefined)
        setItemsState((currentItems = []) => [...prevItems.children, ...currentItems])
    }

    const handleNextPage = async () => {
        setNextPageLoading(true)
        const nextItems = await docAPI(pathname, nextPage)
        setNextPageLoading(false)
        setNextPageState(nextItems.children_has_next_page ? nextItems.children_page + 1 : undefined)
        setItemsState((currentItems = []) => [...currentItems, ...nextItems.children])
    }

    return (
        <List dense disablePadding className={classes.column}>
            {prevPageState && (
                <ListItem component={ButtonBase} onClick={prevPageLoading ? undefined : handlePrevPage}>
                    {prevPageLoading ? <CircularProgress size={18} thickness={5} /> : <ListItemIcon>{reactIcons.moreFiles}</ListItemIcon>}
                </ListItem>
            )}

            {!itemsState ? (
                <Loading />
            ) : (
                itemsState.map((item) => <FinderItem key={item.id} pathname={pathname} item={item} active={active} selected={selected} />)
            )}

            {nextPageState && (
                <ListItem component={ButtonBase} onClick={nextPageLoading ? undefined : handleNextPage}>
                    {nextPageLoading ? <CircularProgress size={18} thickness={5} /> : <ListItemIcon>{reactIcons.moreFiles}</ListItemIcon>}
                </ListItem>
            )}
        </List>
    )
}
