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
    lang: {
        filterLabel: 'Language',
        chipLabel: 'Language',
        type: 'term-or',
    },
    'email-domains': {
        filterLabel: 'Email domain',
        chipLabel: 'Email domain',
        type: 'term-or',
        hideEmpty: true,
    },
    'from.keyword': {
        filterLabel: 'Email from',
        chipLabel: 'Email from',
        type: 'term-or',
        hideEmpty: true,
    },
    'to.keyword': {
        filterLabel: 'Email to',
        chipLabel: 'Email to',
        type: 'term-or',
        hideEmpty: true,
    },
    'path-parts': {
        filterLabel: 'Path',
        chipLabel: 'Path',
        type: 'term-or',
        hideEmpty: true,
    }
}
