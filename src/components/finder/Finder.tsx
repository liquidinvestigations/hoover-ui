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
    searchPreview: {
        height: '60%',
        borderBottom: '1px solid #d3d3d3',
    },
}))

export const Finder: FC = observer(() => {
    const { classes, cx } = useStyles()
    const {
        fullPage,
        documentStore: { pathname, hierarchy },
    } = useSharedStore()

    const columns = useMemo(() => {
        if (!pathname || !hierarchy) return [{} as ColumnItem]
        return makeColumns(hierarchy, getBasePath(pathname), !fullPage ? 1 : undefined)
    }, [hierarchy, pathname, fullPage])

    return (
        <ErrorBoundary visible>
            <div className={cx(classes.container, { [classes.searchPreview]: !fullPage })}>
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
