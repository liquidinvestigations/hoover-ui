import { TreeItem } from '@mui/lab'
import { useTranslate } from '@tolgee/react'
import { FC, SyntheticEvent, useCallback, useEffect } from 'react'

import { BookmarkItem, useDocument } from '../DocumentProvider'

interface BookmarksProps {
    onSelect: (index: number) => void
}

export const Bookmarks: FC<BookmarksProps> = ({ onSelect }) => {
    const { t } = useTranslate()
    const doc = useDocument()?.doc
    const bookmarks = useDocument()?.bookmarks
    const setBookmarks = useDocument()?.setBookmarks

    const createItemsTree = useCallback(
        async (items?: BookmarkItem[]): Promise<BookmarkItem[]> => {
            const elements = []
            if (items?.length) {
                for (const element of items) {
                    const { title, dest, items: subItems } = element
                    const index = await new Promise<number>((resolve) => {
                        doc?.getDestination(dest).then((dest) => {
                            if (dest) {
                                const ref = dest[0]
                                doc.getPageIndex(ref).then(resolve)
                            }
                        })
                    })
                    elements.push({ title, dest, index, items: await createItemsTree(subItems) })
                }
            }
            return elements
        },
        [doc],
    )

    useEffect(() => {
        ;(async () => {
            const outline = await new Promise((resolve) => {
                doc?.getOutline().then(resolve)
            })
            const tree = await createItemsTree(outline as BookmarkItem[])
            setBookmarks?.(tree)
        })()
    }, [doc, createItemsTree, setBookmarks])

    const renderTree = useCallback(
        (items: BookmarkItem[]) => {
            const handleItemClick = (index: number) => (event: SyntheticEvent) => {
                event.preventDefault()
                onSelect(index)
            }
            return !items?.length
                ? null
                : items.map(({ title, index, items: subItems }, id) => (
                      <TreeItem key={id} nodeId={title} label={<span onClick={handleItemClick(index)}>{title}</span>}>
                          {renderTree(subItems)}
                      </TreeItem>
                  ))
        },
        [onSelect],
    )

    return !bookmarks?.length ? <TreeItem nodeId="0" label={t('no_bookmarks', 'No bookmarks')} /> : <>{renderTree(bookmarks)}</>
}
