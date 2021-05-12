export const aggregationCategories = {
    tags: {
        label: 'Tags',
        icon: 'tag',
        filters: ['tags', 'priv-tags'],
    },
    dates: {
        label: 'Dates',
        icon: 'calendar',
        filters: ['date', 'date-created'],
    },
    type: {
        label: 'File Types',
        icon: 'category',
        filters: ['content-type', 'filetype'],
    },
    language: {
        label: 'Language',
        icon: 'language',
        filters: ['lang'],
    },
    email: {
        label: 'Email',
        icon: 'email',
        filters: ['email-domains', 'from.keyword', 'to.keyword', 'attachments', 'pgp'],
    },
    location: {
        label: 'Location',
        icon: 'tree',
        filters: ['path-parts'],
    },
    size: {
        label: 'File Sizes',
        icon: 'size',
        filters: ['size', 'word-count']
    },
    ocr: {
        label: 'OCR',
        icon: 'ocr',
        filters: ['ocr']
    },
}

export const aggregationFields = {
    tags: {
        filterLabel: 'Public tags',
        chipLabel: 'Public tag',
        type: 'term-and',
    },
    'priv-tags': {
        filterLabel: 'Private tags',
        chipLabel: 'Private tag',
        type: 'term-and',
    },
    date: {
        filterLabel: 'Date modified',
        chipLabel: 'Date modified',
        type: 'date',
    },
    'date-created': {
        filterLabel: 'Date created',
        chipLabel: 'Date created',
        type: 'date',
    },
    'content-type': {
        filterLabel: 'Content type',
        chipLabel: 'Content type',
        type: 'term-or',
    },
    filetype: {
        filterLabel: 'File type',
        chipLabel: 'File type',
        type: 'term-or',
    },
    lang: {
        filterLabel: 'Language',
        chipLabel: 'Language',
        type: 'term-or',
    },
    'email-domains': {
        filterLabel: 'Email domain',
        chipLabel: 'Email domain',
        type: 'term-or',
    },
    'from.keyword': {
        filterLabel: 'Email from',
        chipLabel: 'Email from',
        type: 'term-or',
    },
    'to.keyword': {
        filterLabel: 'Email to',
        chipLabel: 'Email to',
        type: 'term-or',
    },
    attachments: {
        filterLabel: 'Has Attachments',
        chipLabel: 'Has Attachments',
        type: 'term-or',
    },
    pgp: {
        filterLabel: 'PGP Encrypted',
        chipLabel: 'PGP Encrypted',
        type: 'term-or',
    },
    'path-parts': {
        filterLabel: 'Path',
        chipLabel: 'Path',
        type: 'term-or',
        bucketsMax: true,
    },
    size: {
        filterLabel: 'Size',
        chipLabel: 'Size',
        type: 'range-or',
        buckets: [
            {
                key: '0-1',
                label: '0 B',
            },
            {
                key: '1-1000',
                label: '1 B - 1 KB',
            },
            {
                key: '1000-500000',
                label: '1 KB - 500 KB',
            },
            {
                key: '500000-1000000',
                label: '500 KB - 1 MB',
            },
            {
                key: '1000000-500000000',
                label: '1 MB - 500 MB',
            },
            {
                key: '500000000-1000000000',
                label: '500 MB - 1 GB',
            },
            {
                key: '1000000000-*',
                label: '>= 1 GB',
            },
            /*{
                key: '1000000000-500000000000',
                label: '1 GB - 500 GB',
            },
            {
                key: '500000000000-1000000000000',
                label: '500 GB - 1 TB',
            },
            {
                key: '1000000000000-*',
                label: '>= 1 TB',
            },*/
        ]
    },
    'word-count': {
        filterLabel: 'Word count',
        chipLabel: 'Word count',
        type: 'range-or',
        buckets: [
            {
                key: '0-1',
                label: '0',
            },
            {
                key: '1-9',
                label: '1 - 9',
            },
            {
                key: '10-99',
                label: '10 - 99',
            },
            {
                key: '100-999',
                label: '100 - 999',
            },
            {
                key: '1000-9999',
                label: '1,000 - 9,999',
            },
            {
                key: '10000-99999',
                label: '10,000 - 99,999',
            },
            {
                key: '100000-999999',
                label: '100,000 - 999,999',
            },
            {
                key: '1000000-*',
                label: '>= 1,000,000',
            },
        ]
    },
    ocr: {
        filterLabel: 'OCRed',
        chipLabel: 'OCRed',
        type: 'term-or',
    },
}
