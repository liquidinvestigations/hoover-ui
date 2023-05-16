import { List } from '@mui/material'
import { FC } from 'react'
import { makeStyles } from 'tss-react/mui'

import { Loading } from '../common/Loading/Loading'

import { FinderItem } from './FinderItem'
import { ColumnItem, LocalDocumentData } from './Types'

const useStyles = makeStyles()(() => ({
    column: {
        backgroundColor: '#fff',
        borderRight: '1px solid #d3d3d3',
        minWidth: 200,
        overflowY: 'auto',
    },
}))

interface FinderColumnProps extends ColumnItem {
    active?: LocalDocumentData
}

export const FinderColumn: FC<FinderColumnProps> = ({ items, pathname, prevPage, nextPage, active, selected }) => {
    const { classes } = useStyles()

    return (
        <List dense disablePadding className={classes.column}>
            {!items ? (
                <Loading />
            ) : (
                items.map((item) => <FinderItem key={item.id} pathname={pathname} item={item} active={active} selected={selected} />)
            )}
        </List>
    )
}
