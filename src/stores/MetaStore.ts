import { makeAutoObservable } from 'mobx'

import { DocumentContent, DocumentData, SourceField } from '../Types'
import { flatten, formatDateTime, getLanguageName, humanFileSize } from '../utils/utils'

export interface TableData {
    field: string
    label: string
    display: string
    searchKey: SourceField
    searchTerm: string
}

export interface MetaData {
    key: string
    value: any
    componentKey: string
}

export class MetaStore {
    tableFields: Partial<
        Record<
            SourceField,
            {
                label: string
                searchKey?: SourceField
                visible?: (content?: Partial<DocumentContent>) => boolean
                format?: (term?: any) => string
                searchTerm?: (term: any) => string
            }
        >
    > = {
        filename: {
            label: 'Filename',
        },
        path: {
            label: 'Path',
            searchKey: 'path-parts',
        },
        filetype: {
            label: 'Type',
            visible: (content) => !!content?.filetype,
        },
        md5: {
            label: 'MD5',
            visible: (content) => content?.filetype !== 'folder' && !!content?.md5,
        },
        sha1: {
            label: 'SHA1',
            visible: (content) => content?.filetype !== 'folder' && !!content?.sha1,
        },
        lang: {
            label: 'Language',
            format: getLanguageName,
            visible: (content) => !!content?.lang,
        },
        date: {
            label: 'Modified',
            format: formatDateTime,
            visible: (content) => !!content?.date,
        },
        'date-created': {
            label: 'Created',
            format: formatDateTime,
            visible: (content) => !!content?.['date-created'],
        },
        pgp: {
            label: 'PGP',
            format: () => 'true',
            searchTerm: () => 'true',
            visible: (content) => !!content?.pgp,
        },
        'word-count': {
            label: 'Word count',
            searchTerm: (term) => term.toString(),
            visible: (content) => !!content?.['word-count'],
        },
        size: {
            label: 'Size',
            format: humanFileSize,
            searchTerm: (term) => term.toString(),
            visible: (content) => !!content?.size,
        },
    }

    tableData: Array<TableData> = []

    metaData: Array<MetaData> = []

    constructor() {
        makeAutoObservable(this)
    }

    updateData = (data: DocumentData) => {
        this.tableData = this.updateTableFieldsData(data)
        this.metaData = this.updateMetaFieldsData(data)
    }

    updateTableFieldsData = (data: DocumentData) => {
        if (!data.content) return []

        return Object.entries(this.tableFields)
            .filter(([, config]) => !config.visible || config.visible(data?.content) !== false)
            .map(([field, config]) => {
                const fieldContent = data?.content[field as keyof DocumentContent] as string
                const fieldValue = Array.isArray(fieldContent) ? fieldContent[0] : fieldContent
                const display = config.format ? config.format(data?.content?.[field as keyof DocumentContent]) : fieldValue
                const searchKey = config.searchKey || (field as SourceField)
                const searchTerm = config.searchTerm ? config.searchTerm(data?.content?.[field as keyof DocumentContent]) : fieldValue

                return {
                    field,
                    label: config.label,
                    display,
                    searchKey,
                    searchTerm,
                }
            })
    }

    updateMetaFieldsData = (data: DocumentData) => {
        if (!data.content) return []

        const uniqueEntries = new Set<string>()
        const entries = Object.entries(data.content)

        const filteredEntries = entries.filter(
            ([key, value]) =>
                !['text', 'ocrtext', 'path-text', 'path-parts'].includes(key) &&
                ((!Array.isArray(value) && value) || (Array.isArray(value) && value.length)),
        )

        const mappedEntries = filteredEntries.flatMap(([key, value]) => {
            let elements: Record<string, any>
            if (Array.isArray(value)) {
                elements = { [key]: value }
            } else if (typeof value === 'object') {
                elements = flatten(value, [key])
            } else if (typeof value === 'boolean') {
                elements = { [key]: value ? 'true' : 'false' }
            } else {
                elements = { [key]: value }
            }

            return Object.entries(elements).flatMap(([subKey, subValue], index) => {
                if (Array.isArray(subValue)) {
                    return subValue.flatMap((v, subIndex) => {
                        const entryString = `${key}${subKey}${v}`
                        if (uniqueEntries.has(entryString)) return [] as never[]
                        uniqueEntries.add(entryString)
                        return [
                            {
                                key: subKey,
                                value: v,
                                componentKey: `${entryString}-${subIndex}`,
                            },
                        ]
                    })
                } else {
                    const entryString = `${key}${subKey}${subValue}`
                    if (uniqueEntries.has(entryString)) return [] as never[]
                    uniqueEntries.add(entryString)
                    return [
                        {
                            key: subKey,
                            value: subValue,
                            componentKey: `${entryString}-${index}`,
                        },
                    ]
                }
            })
        })

        return mappedEntries.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
    }
}
