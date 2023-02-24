export type ResultColumnFormat = 'array' | 'boolean' | 'date' | 'icon' | 'size' | 'string' | 'tags' | 'thumbnail'

export interface ResultColumn {
    label: string
    align: 'center' | 'left' | 'right'
    sortable: boolean
    hidden: boolean
    format: ResultColumnFormat
    path: string
}

export const availableColumns: Record<string, ResultColumn> = {
    filetype: {
        label: 'Filetype',
        align: 'center',
        sortable: true,
        hidden: false,
        format: 'icon',
        path: '_source.filetype',
    },
    preview: {
        label: 'Preview',
        align: 'center',
        sortable: false,
        hidden: false,
        format: 'thumbnail',
        path: '_source.has-thumbnails',
    },
    filename: {
        label: 'Filename',
        align: 'left',
        sortable: false,
        hidden: false,
        format: 'string',
        path: '_source.filename',
    },
    collection: {
        label: 'Collection',
        align: 'left',
        sortable: false,
        hidden: false,
        format: 'string',
        path: '_collection',
    },
    path: {
        label: 'Path',
        align: 'left',
        sortable: true,
        hidden: true,
        format: 'string',
        path: '_source.path',
    },
    tags: {
        label: 'Public tags',
        align: 'left',
        sortable: false,
        hidden: true,
        format: 'tags',
        path: '_source.tags',
    },
    'private-tags': {
        label: 'Private tags',
        align: 'left',
        sortable: false,
        hidden: true,
        format: 'tags',
        path: '_source.private-tags',
    },
    'word-count': {
        label: 'Words',
        align: 'right',
        sortable: true,
        hidden: false,
        format: 'string',
        path: '_source.word-count',
    },
    size: {
        label: 'Size',
        align: 'right',
        sortable: true,
        hidden: false,
        format: 'size',
        path: '_source.size',
    },
    'content-type': {
        label: 'Content type',
        align: 'left',
        sortable: true,
        hidden: true,
        format: 'string',
        path: '_source.content-type',
    },
    date: {
        label: 'Date modified',
        align: 'right',
        sortable: true,
        hidden: true,
        format: 'date',
        path: '_source.date',
    },
    'date-created': {
        label: 'Date created',
        align: 'right',
        sortable: true,
        hidden: true,
        format: 'date',
        path: '_source.date-created',
    },
    'email-domains': {
        label: 'Email domains',
        align: 'right',
        sortable: false,
        hidden: true,
        format: 'array',
        path: '_source.email-domains',
    },
    from: {
        label: 'Email from',
        align: 'right',
        sortable: false,
        hidden: true,
        format: 'string',
        path: '_source.from',
    },
    to: {
        label: 'Email to',
        align: 'right',
        sortable: false,
        hidden: true,
        format: 'array',
        path: '_source.to',
    },
    ocr: {
        label: 'OCR',
        align: 'center',
        sortable: true,
        hidden: true,
        format: 'boolean',
        path: '_source.ocr',
    },
    pgp: {
        label: 'Encrypted',
        align: 'center',
        sortable: true,
        hidden: true,
        format: 'boolean',
        path: '_source.pgp',
    },
}
