import { makeStyles } from '@mui/styles'
import { observer } from 'mobx-react-lite'
import { FC, useEffect, useState } from 'react'

import { doc as docAPI } from '../../../backend/api'
import { getBasePath } from '../../../utils/utils'
import ErrorBoundary from '../../ErrorBoundary'
import { useSharedStore } from '../../SharedStoreProvider'

import { FinderColumn } from './FinderColumn'
import { makeColumns } from './utils'

import type { ColumnItem, LocalDocumentData } from './Types'

const parentLevels = 3

const useStyles = makeStyles(() => ({
    container: {
        display: 'flex',
        overflowX: 'auto',
    },
}))

export const Finder: FC = observer(() => {
    const classes = useStyles()
    const { data, pathname, loading } = useSharedStore().documentStore

    const [active, setActive] = useState<LocalDocumentData>()
    const [columns, setColumns] = useState<ColumnItem[]>([])

    useEffect(() => {
        ;(async () => {
            if (!loading && pathname && data) {
                const localData = { ...data }
                let current: LocalDocumentData | undefined = localData
                let level = 0

                setActive(current)
                setColumns(makeColumns(current, getBasePath(pathname)))

                while (current?.parent_id && level <= parentLevels) {
                    current.parent = await docAPI(getBasePath(pathname) + current.parent_id, current.parent_children_page)

                    current = current.parent
                    level++

                    setColumns(makeColumns(localData, getBasePath(pathname)))
                }
            }
        })()
    }, [data, pathname, loading])

    return (
        <ErrorBoundary visible>
            <div className={classes.container}>
                {columns.map(({ items, pathname, prevPage, nextPage, selected }, index) => (
                    <FinderColumn
                        key={pathname + index}
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
})
