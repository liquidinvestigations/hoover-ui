import { TreeItem } from '@mui/lab'
import { observer } from 'mobx-react-lite'
import { FC, useCallback, useEffect, MouseEvent } from 'react'

import { BookmarksTreeItem } from '../../stores/PDFViewerStore'
import { useSharedStore } from '../SharedStoreProvider'

export const Bookmarks: FC = observer(() => {
    const { doc, bookmarks, setBookmarks, goToPage } = useSharedStore().pdfViewerStore

    if (!doc) {
        return null
    }

    const createBookmarksTree = async (items: BookmarksTreeItem[]) => {
        const elements: BookmarksTreeItem[] = []
        if (items?.length) {
            for (const element of items) {
                const { title, dest, items: subItems } = element
                const index = await new Promise((resolve: (index: number) => void) => {
                    doc.getDestination(dest).then((dest) => {
                        doc.getPageIndex(dest?.[0]).then(resolve)
                    })
                })
                elements.push({ title, dest, index, items: await createBookmarksTree(subItems) })
            }
        }
        return elements
    }

    useEffect(() => {
        ;(async () => {
            const outline = await new Promise((resolve) => {
                doc.getOutline().then(resolve)
            })
            const tree = await createBookmarksTree(outline as BookmarksTreeItem[])
            setBookmarks(tree)
        })()
    }, [doc, createBookmarksTree, setBookmarks])

    const handleItemClick = (index: number) => (event: MouseEvent) => {
        event.preventDefault()
        goToPage(index)
    }

    let id = 1
    const renderTree = useCallback(
        (items: BookmarksTreeItem[]) =>
            !items?.length
                ? null
                : items.map(({ title, index, items: subItems }) => (
                      <TreeItem key={id} nodeId={title} label={title} onClick={handleItemClick(index)}>
                          {renderTree(subItems)}
                      </TreeItem>
                  )),
        [bookmarks, handleItemClick, id]
    )

    return !bookmarks.length ? <TreeItem nodeId="0" label="No bookmarks" /> : <>{renderTree(bookmarks)}</>
})
