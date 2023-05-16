import { observer } from 'mobx-react-lite'
import { FC, useMemo } from 'react'
import { makeStyles } from 'tss-react/mui'

import { getBasePath } from '../../utils/utils'
import { ErrorBoundary } from '../ErrorBoundary'
import { useSharedStore } from '../SharedStoreProvider'

import { FinderColumn } from './FinderColumn'
import { ColumnItem, LocalDocumentData } from './Types'
import { makeColumns } from './utils'

const useStyles = makeStyles()(() => ({
    container: {
        display: 'flex',
        overflowX: 'auto',
    },
}))

export const Finder: FC = observer(() => {
    const { classes } = useStyles()
    const { pathname, hierarchy } = useSharedStore().documentStore

    const columns = useMemo(() => {
        if (!pathname || !hierarchy) return [{} as ColumnItem];
        return makeColumns(hierarchy, getBasePath(pathname))
    }, [hierarchy, pathname])

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
                        active={{ ...hierarchy } as LocalDocumentData}
                        selected={selected}
                    />
                ))}
            </div>
        </ErrorBoundary>
    )
})
