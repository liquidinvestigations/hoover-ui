import { ChildDocument, DocumentData } from '../../Types'

export interface LocalDocumentData extends DocumentData {
    parent?: LocalDocumentData
}

export interface ColumnItem {
    items: ChildDocument[] | LocalDocumentData[]
    prevPage?: number
    nextPage?: number
    pathname: string
    selected: ChildDocument | LocalDocumentData
}
