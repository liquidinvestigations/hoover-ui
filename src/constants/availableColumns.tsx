import { T } from '@tolgee/react'
import { ReactElement } from 'react'

export type ResultColumnFormat = 'array' | 'boolean' | 'date' | 'icon' | 'size' | 'string' | 'tags' | 'thumbnail'

export interface ResultColumn {
    label: ReactElement
    align: 'center' | 'left' | 'right'
    sortable: boolean
    hidden: boolean
    format: ResultColumnFormat
    path: string
}

export const availableColumns: Record<string, ResultColumn> = {
    filetype: {
        label: <T keyName="filetype">File type</T>,
        align: 'center',
        sortable: true,
        hidden: false,
        format: 'icon',
        path: '_source.filetype',
    },
    preview: {
        label: <T keyName="preview">Preview</T>,
        align: 'center',
        sortable: false,
        hidden: false,
        format: 'thumbnail',
        path: '_source.has-thumbnails',
    },
    filename: {
        label: <T keyName="filename">File name</T>,
        align: 'left',
        sortable: false,
        hidden: false,
        format: 'string',
        path: '_source.filename',
    },
    collection: {
        label: <T keyName="collection">Collection</T>,
        align: 'left',
        sortable: false,
        hidden: false,
        format: 'string',
        path: '_collection',
    },
    path: {
        label: <T keyName="path">Path</T>,
        align: 'left',
        sortable: true,
        hidden: true,
        format: 'string',
        path: '_source.path',
    },
    tags: {
        label: <T keyName="tags_public">Public tags</T>,
        align: 'left',
        sortable: false,
        hidden: true,
        format: 'tags',
        path: '_source.tags',
    },
    'private-tags': {
        label: <T keyName="tags_private">Private tags</T>,
        align: 'left',
        sortable: false,
        hidden: true,
        format: 'tags',
        path: '_source.private-tags',
    },
    'word-count': {
        label: <T keyName="word-count">Word count</T>,
        align: 'right',
        sortable: true,
        hidden: false,
        format: 'string',
        path: '_source.word-count',
    },
    size: {
        label: <T keyName="size">Size</T>,
        align: 'right',
        sortable: true,
        hidden: false,
        format: 'size',
        path: '_source.size',
    },
    'content-type': {
        label: <T keyName="content-type">Content type</T>,
        align: 'left',
        sortable: true,
        hidden: true,
        format: 'string',
        path: '_source.content-type',
    },
    date: {
        label: <T keyName="date-modified">Date modified</T>,
        align: 'right',
        sortable: true,
        hidden: true,
        format: 'date',
        path: '_source.date',
    },
    'date-created': {
        label: <T keyName="date-created">Date created</T>,
        align: 'right',
        sortable: true,
        hidden: true,
        format: 'date',
        path: '_source.date-created',
    },
    'email-domains': {
        label: <T keyName="email_domains">Email domains</T>,
        align: 'right',
        sortable: false,
        hidden: true,
        format: 'array',
        path: '_source.email-domains',
    },
    from: {
        label: <T keyName="email-from">Email from</T>,
        align: 'right',
        sortable: false,
        hidden: true,
        format: 'string',
        path: '_source.from',
    },
    to: {
        label: <T keyName="email-to">Email to</T>,
        align: 'right',
        sortable: false,
        hidden: true,
        format: 'array',
        path: '_source.to',
    },
    ocr: {
        label: <T keyName="ocr">OCR</T>,
        align: 'center',
        sortable: true,
        hidden: true,
        format: 'boolean',
        path: '_source.ocr',
    },
    pgp: {
        label: <T keyName="encryption">Encryption</T>,
        align: 'center',
        sortable: true,
        hidden: true,
        format: 'boolean',
        path: '_source.pgp',
    },
}
