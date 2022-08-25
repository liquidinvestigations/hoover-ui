import React, { useEffect, useState } from 'react'
import { makeStyles } from '@mui/styles'
import FinderColumn from './FinderColumn'
import { useDocument } from '../DocumentProvider'
import ErrorBoundary from '../../ErrorBoundary'
import { doc as docAPI } from '../../../backend/api'
import { getBasePath } from '../../../utils'

const parentLevels = 3

const makeColumns = (doc, pathname) => {
    const columns = []

    const createColumn = (item, selected) => {
        columns.unshift({
            items: item.children,
            prevPage: item.children_page > 1 ? item.children_page - 1 : null,
            nextPage: item.children_has_next_page ? item.children_page + 1 : null,
            pathname: pathname + item.id,
            selected
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
            const localData = {...data}
            let current = localData
            let level = 0

            setActive(current)
            setColumns(makeColumns(current, getBasePath(pathname)))

            while (current.parent_id && level <= parentLevels) {
                current.parent = await docAPI(
                    getBasePath(pathname) + current.parent_id,
                    current.parent_children_page
                )

                current = current.parent
                level++

                setColumns(makeColumns(localData, getBasePath(pathname)))
            }
        }
    }, [data, pathname, loading])

    return (
        <ErrorBoundary visible>
            <div className={classes.container}>
                {columns.map(({ items, pathname, prevPage, nextPage, selected }) => (
                    <FinderColumn
                        key={pathname}
                        items={items}
                        pathname={pathname}
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
