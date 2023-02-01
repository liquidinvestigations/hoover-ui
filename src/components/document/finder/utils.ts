import { ColumnItem, LocalDocumentData } from './Types'
import { ChildDocument } from '../../../stores/DocumentStore'

export const makeColumns = (doc: LocalDocumentData, pathname: string | null) => {
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

    if (doc.parent) {
        let node = doc
        while (node.parent) {
            createColumn(node.parent, node)
            node = node.parent
        }
        columns.unshift({
            items: [node],
            pathname: pathname + node.id,
            selected: node,
        })
    } else {
        columns.unshift({
            items: [doc],
            pathname: pathname + doc.id,
            selected: doc,
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
