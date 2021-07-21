import React, { useEffect, useState } from 'react'
import FinderColumn from './FinderColumn'
import { useDocument } from '../DocumentProvider'
import ErrorBoundary from '../../ErrorBoundary'
import { doc as docAPI } from '../../../backend/api'
import { getBasePath } from '../../../utils'
import { makeStyles } from '@material-ui/core/styles'

const parentLevels = 3

const makeColumns = doc => {
    const columns = []

    const createColumn = (item, selected) => {
        columns.unshift({
            items: item.children,
            prevPage: item.children_page > 1 ? item.children_page - 1 : null,
            nextPage: item.children_has_next_page ? item.children_page + 1 : null,
            selected,
        })
    }

    if (doc.children) {
        createColumn(doc, doc)
    }

    if (doc.parent) {
        let node = doc
        while (node.parent) {
            createColumn(node.parent, node)
            node = node.parent
        }
        columns.unshift({
            items: [node],
            selected: node,
        })
    } else {
        columns.unshift({
            items: [doc],
            selected: doc,
        })
    }

    return columns
}

const useStyles = makeStyles(theme => ({
    container: {
        display: 'flex',
        overflowX: 'auto',
    }
}))

export default function Finder() {
    const classes = useStyles()
    const { data, pathname, loading } = useDocument()

    const [active, setActive] = useState()
    const [columns, setColumns] = useState([])

    useEffect(async () => {
        if (!loading && pathname && data) {
            let current = data;
            let level = 0;

            setActive(data)

            while (current.parent_id && level <= parentLevels) {
                current.parent = await docAPI(
                    getBasePath(pathname) + current.parent_id,
                    current.parent_children_page
                )

                current = current.parent
                level++

                setColumns(makeColumns(data))
            }
        }
    }, [data, pathname, loading])

    return (
        <ErrorBoundary visible>
            <div className={classes.container}>
                {columns.map(({ items, prevPage, nextPage, selected }, index) => (
                    <FinderColumn
                        key={index}
                        items={items}
                        prevPage={prevPage}
                        nextPage={nextPage}
                        active={active}
                        selected={selected}
                    />
                ))}
            </div>
        </ErrorBoundary>
    )
}
