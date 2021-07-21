import React from 'react'
import { ButtonBase, List, ListItem } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import FinderItem from './FinderItem'

const useStyles = makeStyles(theme => ({
    column: {
        backgroundColor: '#fff',
        borderRight: '1px solid #d3d3d3',
        minWidth: 200,
        overflowY: 'auto',
    }
}))

export default function FinderColumn({ items, prevPage, nextPage, active, selected }) {
    const classes = useStyles()

    const handlePrevPage = () => {

    }

    const handleNextPage = () => {

    }

    return (
        <List dense disablePadding className={classes.column}>
            {prevPage && (
                <ListItem
                    component={ButtonBase}
                    onClick={handlePrevPage}
                >
                    ...
                </ListItem>
            )}

            {items.map(item => (
                <FinderItem
                    key={item.file || item.id}
                    item={item}
                    active={active}
                    selected={selected}
                />
            ))}

            {nextPage && (
                <ListItem
                    component={ButtonBase}
                    onClick={handleNextPage}
                >
                    ...
                </ListItem>
            )}
        </List>
    )
}
