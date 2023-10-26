import { T } from '@tolgee/react'
import { makeAutoObservable } from 'mobx'
import { ReactElement } from 'react'

import { DocumentContent, DocumentData, SourceField, ValueOf } from '../Types'
import { flatten, formatDateTime, getLanguageName, humanFileSize } from '../utils/utils'

export interface TableData {
    field: string
    label: ReactElement | string
    display: string
    searchKey: SourceField
    searchTerm: string
}

export interface MetaData {
    key: string
    value: string | number | boolean | Array<string>
    componentKey: string
}

export class MetaStore {
    tableFields: Partial<
        Record<
            SourceField,
            {
                label: ReactElement | string
                searchKey?: SourceField
                visible?: (content?: Partial<DocumentContent>) => boolean
                format?: (term: string, locale?: string) => ReactElement | string
                searchTerm?: (term: string) => string
            }
        >
    > = {
        filename: {
            label: <T keyName="filename">File name</T>,
        },
        path: {
            label: <T keyName="path">Path</T>,
            searchKey: 'path-parts',
        },
        filetype: {
            label: <T keyName="filetype">Type</T>,
            visible: (content) => !!content?.filetype,
        },
        md5: {
            label: <T keyName="md5">MD5</T>,
            visible: (content) => content?.filetype !== 'folder' && !!content?.md5,
        },
        sha1: {
            label: <T keyName="sha1">SHA1</T>,
            visible: (content) => content?.filetype !== 'folder' && !!content?.sha1,
        },
        lang: {
            label: <T keyName="language">Language</T>,
            format: getLanguageName,
            visible: (content) => !!content?.lang,
        },
        date: {
            label: <T keyName="modified">Modified</T>,
            format: formatDateTime,
            visible: (content) => !!content?.date,
        },
        'date-created': {
            label: <T keyName="created">Created</T>,
            format: formatDateTime,
            visible: (content) => !!content?.['date-created'],
        },
        pgp: {
            label: <T keyName="pgp">PGP</T>,
            format: () => 'true',
            searchTerm: () => 'true',
            visible: (content) => !!content?.pgp,
        },
        'word-count': {
            label: <T keyName="word-count">Word count</T>,
            searchTerm: (term) => term.toString(),
            visible: (content) => !!content?.['word-count'],
        },
        size: {
            label: <T keyName="size">Size</T>,
            format: (bytes: string) => humanFileSize(parseInt(bytes)),
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

    normalizeDocumentContent = (value: ValueOf<DocumentContent>): string => {
        if (value === null || value === undefined) {
            return ''
        } else if (typeof value === 'number' || typeof value === 'boolean') {
            return value.toString()
        } else if (Array.isArray(value)) {
            return value.join(', ')
        } else if (typeof value === 'string') {
            return value
        } else if (typeof value === 'object') {
            return JSON.stringify(value)
        }

        return ''
    }

    updateTableFieldsData = (data: DocumentData): TableData[] => {
        if (!data.content) return []

        return Object.entries(this.tableFields)
            .filter(([, config]) => !config.visible || config.visible(data?.content) !== false)
            .map(([field, config]) => {
                const fieldContent = data?.content[field as keyof DocumentContent] as string
                const fieldValue = Array.isArray(fieldContent) ? fieldContent[0] : fieldContent
                const display = config.format
                    ? config.format(
                          this.normalizeDocumentContent(data?.content?.[field as keyof DocumentContent]),
                          localStorage.getItem('language') || 'en',
                      )
                    : fieldValue
                const searchKey = config.searchKey || (field as SourceField)
                const searchTerm = config.searchTerm
                    ? config.searchTerm(this.normalizeDocumentContent(data?.content?.[field as keyof DocumentContent]))
                    : fieldValue

                return {
                    field,
                    label: config.label,
                    display,
                    searchKey,
                    searchTerm,
                }
            })
    }

    updateMetaFieldsData = (data: DocumentData): MetaData[] => {
        if (!data.content) return []

        const uniqueEntries = new Set<string>()
        const entries = Object.entries(data.content)

        const filteredEntries = entries.filter(
            ([key, value]) =>
                !['text', 'ocrtext', 'path-text', 'path-parts'].includes(key) &&
                ((!Array.isArray(value) && value) || (Array.isArray(value) && value.length)),
        )

        const mappedEntries = filteredEntries.flatMap(([key, value]) => {
            let elements: Record<string, string | number | boolean | Array<string>>
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
