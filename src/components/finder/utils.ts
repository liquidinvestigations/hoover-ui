import { ChildDocument } from '../../Types'

import { ColumnItem, LocalDocumentData } from './Types'

export const parentLevels = 4

export const makeColumns = (doc: LocalDocumentData, pathname: string | null, limit?: number) => {
    const columns: ColumnItem[] = []

    const createColumn = (item: LocalDocumentData, selected: LocalDocumentData) => {
        columns.unshift({
            items: item.children,
            prevPage: item.children_page > 1 ? item.children_page - 1 : undefined,
            nextPage: item.children_has_next_page ? item.children_page + 1 : undefined,
            pathname: pathname + item.id,
            selected,
        })
    }

    if (doc.children) {
        createColumn(doc, doc)
    }

    let node = { ...doc }

    while (node.parent && columns.length < (limit ?? parentLevels)) {
        createColumn(node.parent, node)
        node = node.parent
    }

    if (node.parent) {
        columns.unshift({
            items: node.parent.children,
            pathname: pathname + node.id,
            selected: node,
        })
    } else {
        columns.unshift({
            items: [node],
            pathname: pathname + doc.id,
            selected: node,
        })
    }

    return columns
}

export const filenameFor = (item: Partial<LocalDocumentData & ChildDocument>) => {
    if (item.filename) {
        return item.filename
    } else {
        const { filename, path } = item.content || {}
        return filename || path?.split('/').filter(Boolean).pop() || path || '/'
    }
}
