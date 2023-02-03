export const aggregationCategories = {
    tags: {
        label: 'Tags',
        icon: 'categoryTags',
        filters: ['tags', 'priv-tags'],
    },
    dates: {
        label: 'Dates',
        icon: 'categoryDates',
        filters: ['date', 'date-created'],
    },
    type: {
        label: 'File Types',
        icon: 'categoryType',
        filters: ['filetype', 'content-type', 'skipped'],
    },
    language: {
        label: 'Language',
        icon: 'categoryLanguage',
        filters: [
            'lang',
            'translated-from',
            'translated-to',
            'entity.keyword',
            'entity-type.location.keyword',
            'entity-type.organization.keyword',
            'entity-type.event.keyword',
            'entity-type.person.keyword',
            'entity-type.money.keyword',
        ],
    },
    email: {
        label: 'Email',
        icon: 'categoryEmail',
        filters: ['email-domains', 'from.keyword', 'to.keyword', 'attachments', 'pgp'],
    },
    location: {
        label: 'Location',
        icon: 'categoryLocation',
        filters: ['path-parts'],
    },
    size: {
        label: 'File Sizes',
        icon: 'categorySize',
        filters: ['size', 'word-count']
    },
    ocr: {
        label: 'OCR',
        icon: 'ocr',
        filters: ['ocr', 'ocrpdf', 'ocrimage']
    },
    imageAi: {
        label: 'Image AI',
        icon: 'imageAi',
        filters: ['detected-objects.object.keyword', 'image-classes.class.keyword']
    },
    tables: {
        label: 'Tables',
        icon: 'typeXls',
        filters: [ "is-table", "table-columns", "table-sheets", "table-row-count", "table-col-count"]
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
    filetype: {
        filterLabel: 'File type',
        chipLabel: 'File type',
        type: 'term-or',
    },
    'content-type': {
        filterLabel: 'Content type',
        chipLabel: 'Content type',
        type: 'term-or',
    },
    skipped: {
        filterLabel: 'File processing skipped',
        chipLabel: 'File processing skipped',
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
    'ocr': {
        filterLabel: 'OCRed',
        chipLabel: 'OCRed',
        type: 'term-or',
    },
    'ocrpdf': {
        filterLabel: 'OCRed PDF/Office Document',
        chipLabel: 'OCRed PDF/Office Document',
        type: 'term-or',
    },
    'ocrimage': {
        filterLabel: 'OCRed Image',
        chipLabel: 'OCRed Image',
        type: 'term-or',
    },
    'detected-objects.object.keyword': {
        filterLabel: 'Detected objects',
        chipLabel: 'Detected object',
        type: 'term-or',
    },
    'image-classes.class.keyword': {
        filterLabel: 'Image classes',
        chipLabel: 'Image class',
        type: 'term-or',
    },
    'entity.keyword': {
        filterLabel: 'Entity',
        chipLabel: 'Entity',
        type: 'term-or',
    },
    'entity-type.location.keyword': {
        filterLabel: 'Location entity',
        chipLabel: 'Location entity',
        type: 'term-or',
    },
    'entity-type.organization.keyword': {
        filterLabel: 'Organization entity',
        chipLabel: 'Organization entity',
        type: 'term-or',
    },
    'entity-type.event.keyword': {
        filterLabel: 'Event entity',
        chipLabel: 'Event entity',
        type: 'term-or',
    },
    'entity-type.person.keyword': {
        filterLabel: 'Person entity',
        chipLabel: 'Person entity',
        type: 'term-or',
    },
    'entity-type.money.keyword': {
        filterLabel: 'Money entity',
        chipLabel: 'Money entity',
        type: 'term-or',
    },
    'translated-from': {
        filterLabel: 'Translated From',
        chipLabel: 'Translated From',
        type: 'term-or',
    },
    'translated-to': {
        filterLabel: 'Translated To',
        chipLabel: 'Translated To',
        type: 'term-or',
    },
    "is-table": {
        filterLabel: 'Is Table',
        chipLabel: 'Is Table',
        type: 'term-or',
    },
    "table-columns": {
        filterLabel: 'Table Column Name',
        chipLabel: 'Table Column Name',
        type: 'term-or',
    },
    "table-sheets": {
        filterLabel: 'Table Sheet Name',
        chipLabel: 'Table Sheet Name',
        type: 'term-or',
    },
    "table-row-count": {
        filterLabel: 'Row Count',
        chipLabel: 'Table Row Count',
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
    "table-col-count": {
        filterLabel: 'Column Count',
        chipLabel: 'Table Column Count',
        type: 'range-or',
        buckets: [
            {
                key: '0-1',
                label: '0',
            },
            {
                key: '1-3',
                label: '1 - 3',
            },
            {
                key: '4-9',
                label: '4 - 9',
            },
            {
                key: '10-29',
                label: '10 - 29',
            },
            {
                key: '30-99',
                label: '30 - 99',
            },
            {
                key: '100-*',
                label: '>= 100',
            },
        ]
    },
    "table-sheet-count": {
        filterLabel: 'Sheet Count',
        chipLabel: 'Table Sheet Count',
        type: 'range-or',
        buckets: [
            {
                key: '0-1',
                label: '0',
            },
            {
                key: '1-3',
                label: '1 - 3',
            },
            {
                key: '4-9',
                label: '4 - 9',
            },
            {
                key: '10-29',
                label: '10 - 29',
            },
            {
                key: '30-99',
                label: '30 - 99',
            },
            {
                key: '100-*',
                label: '>= 100',
            },
        ]
    },
}
