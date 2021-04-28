import React from 'react'
import { AccountTree, AlternateEmail, Category, DateRange, Language, LocalOffer, SettingsEthernet, Translate } from '@material-ui/icons'

export const aggregationFields = {
    tags: {
        category: 'tags',
        categoryLabel: 'Tags',
        categoryIcon: <LocalOffer />,
        filterLabel: 'Public tags',
        chipLabel: 'Public tag',
        type: 'term-and',
    },
    'priv-tags': {
        category: 'tags',
        filterLabel: 'Private tags',
        chipLabel: 'Private tag',
        type: 'term-and',
    },
    date: {
        category: 'dates',
        categoryLabel: 'Dates',
        categoryIcon: <DateRange />,
        filterLabel: 'Date modified',
        chipLabel: 'Date modified',
        type: 'date',
    },
    'date-created': {
        category: 'dates',
        filterLabel: 'Date created',
        chipLabel: 'Date created',
        type: 'date',
    },
    'content-type': {
        category: 'type',
        categoryLabel: 'File Types',
        categoryIcon: <Category />,
        filterLabel: 'Content type',
        chipLabel: 'Content type',
        type: 'term-or',
    },
    filetype: {
        category: 'type',
        filterLabel: 'File type',
        chipLabel: 'File type',
        type: 'term-or',
    },
    lang: {
        category: 'language',
        categoryLabel: 'Language',
        categoryIcon: <Language />,
        filterLabel: 'Language',
        chipLabel: 'Language',
        type: 'term-or',
    },
    'email-domains': {
        category: 'email',
        categoryLabel: 'Email',
        categoryIcon: <AlternateEmail />,
        filterLabel: 'Email domain',
        chipLabel: 'Email domain',
        type: 'term-or',
        hideEmpty: true,
    },
    'from.keyword': {
        category: 'email',
        filterLabel: 'Email from',
        chipLabel: 'Email from',
        type: 'term-or',
        hideEmpty: true,
    },
    'to.keyword': {
        category: 'email',
        filterLabel: 'Email to',
        chipLabel: 'Email to',
        type: 'term-or',
        hideEmpty: true,
    },
    attachments: {
        category: 'email',
        categoryLabel: 'Email',
        filterLabel: 'Has Attachments',
        chipLabel: 'Has Attachments',
        type: 'term-or',
    },
    pgp: {
        category: 'email',
        categoryLabel: 'Email',
        filterLabel: 'PGP Encrypted',
        chipLabel: 'PGP Encrypted',
        type: 'term-or',
    },
    'path-parts': {
        category: 'location',
        categoryLabel: 'Location',
        categoryIcon: <AccountTree />,
        filterLabel: 'Path',
        chipLabel: 'Path',
        type: 'term-or',
        hideEmpty: true,
    },
    size: {
        category: 'size',
        categoryLabel: 'File Sizes',
        categoryIcon: <SettingsEthernet />,
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
        category: 'size',
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
        category: 'ocr',
        categoryLabel: 'OCR',
        categoryIcon: <Translate />,
        filterLabel: 'OCRed',
        chipLabel: 'OCRed',
        type: 'term-or',
    },
}
