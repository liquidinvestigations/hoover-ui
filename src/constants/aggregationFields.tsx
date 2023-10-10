import { T } from '@tolgee/react'
import { ReactElement } from 'react'

import { reactIcons } from './icons'

import type { SourceField } from '../Types'

export interface AggregationCategoryProps {
    label: ReactElement
    icon: keyof typeof reactIcons
    filters: SourceField[]
}

export type AggregationCategory = 'tags' | 'dates' | 'type' | 'language' | 'email' | 'location' | 'size' | 'ocr' | 'imageAi' | 'tables'

export const aggregationCategories: Record<AggregationCategory, AggregationCategoryProps> = {
    tags: {
        label: <T keyName="tags">Tags</T>,
        icon: 'categoryTags',
        filters: ['tags', 'priv-tags'],
    },
    dates: {
        label: <T keyName="dates">Dates</T>,
        icon: 'categoryDates',
        filters: ['date', 'date-created'],
    },
    type: {
        label: <T keyName="file_types">File Types</T>,
        icon: 'categoryType',
        filters: ['filetype', 'content-type', 'skipped'],
    },
    language: {
        label: <T keyName="language">Language</T>,
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
        label: <T keyName="email">Email</T>,
        icon: 'categoryEmail',
        filters: ['email-domains', 'from.keyword', 'to.keyword', 'attachments', 'pgp'],
    },
    location: {
        label: <T keyName="location">Location</T>,
        icon: 'categoryLocation',
        filters: ['path-parts'],
    },
    size: {
        label: <T keyName="file_sizes">File Sizes</T>,
        icon: 'categorySize',
        filters: ['size', 'word-count'],
    },
    ocr: {
        label: <T keyName="ocr">OCR</T>,
        icon: 'ocr',
        filters: ['ocr', 'ocrpdf', 'ocrimage'],
    },
    imageAi: {
        label: <T keyName="image_ai">Image AI</T>,
        icon: 'imageAi',
        filters: ['detected-objects.object.keyword', 'image-classes.class.keyword'],
    },
    tables: {
        label: <T keyName="tables">Tables</T>,
        icon: 'typeXls',
        filters: ['is-table', 'table-columns', 'table-sheets', 'table-row-count', 'table-col-count'],
    },
}

export interface AggregationField {
    filterLabel: ReactElement | string
    chipLabel: ReactElement | string
    type: string
    bucketsMax?: boolean
    buckets?: { key: string; label: ReactElement }[]
    sort: boolean
}

export const aggregationFields: Partial<Record<SourceField, AggregationField>> = {
    tags: {
        filterLabel: <T keyName="tags_public">Public tags</T>,
        chipLabel: <T keyName="tag_public">Public tag</T>,
        type: 'term-and',
        sort: true,
    },
    'priv-tags': {
        filterLabel: <T keyName="tags_private">Private tags</T>,
        chipLabel: <T keyName="tag_private">Private tag</T>,
        type: 'term-and',
        sort: true,
    },
    date: {
        filterLabel: <T keyName="date-modified">Date modified</T>,
        chipLabel: <T keyName="date-modified">Date modified</T>,
        type: 'date',
        sort: false,
    },
    'date-created': {
        filterLabel: <T keyName="date-created">Date created</T>,
        chipLabel: <T keyName="date-created">Date created</T>,
        type: 'date',
        sort: false,
    },
    filetype: {
        filterLabel: <T keyName="filetype">File type</T>,
        chipLabel: <T keyName="filetype">File type</T>,
        type: 'term-or',
        sort: true,
    },
    'content-type': {
        filterLabel: <T keyName="content-type">Content type</T>,
        chipLabel: <T keyName="content-type">Content type</T>,
        type: 'term-or',
        sort: true,
    },
    skipped: {
        filterLabel: <T keyName="skipped">File processing skipped</T>,
        chipLabel: <T keyName="skipped">File processing skipped</T>,
        type: 'term-or',
        sort: true,
    },
    lang: {
        filterLabel: <T keyName="lang">Language</T>,
        chipLabel: <T keyName="lang">Language</T>,
        type: 'term-or',
        sort: true,
    },
    'email-domains': {
        filterLabel: <T keyName="email-domains">Email domain</T>,
        chipLabel: <T keyName="email-domains">Email domain</T>,
        type: 'term-or',
        sort: true,
    },
    'from.keyword': {
        filterLabel: <T keyName="email-from">Email from</T>,
        chipLabel: <T keyName="email-from">Email from</T>,
        type: 'term-or',
        sort: true,
    },
    'to.keyword': {
        filterLabel: <T keyName="email-to">Email to</T>,
        chipLabel: <T keyName="email-to">Email to</T>,
        type: 'term-or',
        sort: true,
    },
    attachments: {
        filterLabel: <T keyName="attachments">Has Attachments</T>,
        chipLabel: <T keyName="attachments">Has Attachments</T>,
        type: 'term-or',
        sort: true,
    },
    pgp: {
        filterLabel: <T keyName="pgp">PGP Encrypted</T>,
        chipLabel: <T keyName="pgp">PGP Encrypted</T>,
        type: 'term-or',
        sort: true,
    },
    'path-parts': {
        filterLabel: <T keyName="path-parts">Path</T>,
        chipLabel: <T keyName="path-parts">Path</T>,
        type: 'term-or',
        bucketsMax: true,
        sort: true,
    },
    size: {
        filterLabel: <T keyName="size">Size</T>,
        chipLabel: <T keyName="size">Size</T>,
        type: 'range-or',
        buckets: [
            {
                key: '0-1',
                label: <T keyName="size-0-1">0 B</T>,
            },
            {
                key: '1-1000',
                label: <T keyName="size-1-1000">1 B - 1 KB</T>,
            },
            {
                key: '1000-500000',
                label: <T keyName="size-1000-500000">1 KB - 500 KB</T>,
            },
            {
                key: '500000-1000000',
                label: <T keyName="size-500000-1000000">500 KB - 1 MB</T>,
            },
            {
                key: '1000000-500000000',
                label: <T keyName="size-1000000-500000000">1 MB - 500 MB</T>,
            },
            {
                key: '500000000-1000000000',
                label: <T keyName="size-500000000-1000000000">500 MB - 1 GB</T>,
            },
            {
                key: '1000000000-*',
                label: <T keyName="size-1000000000-*">{'>= 1 GB'}</T>,
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
        ],
        sort: false,
    },
    'word-count': {
        filterLabel: <T keyName="word-count">Word count</T>,
        chipLabel: <T keyName="word-count">Word count</T>,
        type: 'range-or',
        buckets: [
            {
                key: '0-1',
                label: <T keyName="word-count-0-1">0</T>,
            },
            {
                key: '1-9',
                label: <T keyName="word-count-1-9">1 - 9</T>,
            },
            {
                key: '10-99',
                label: <T keyName="word-count-10-99">10 - 99</T>,
            },
            {
                key: '100-999',
                label: <T keyName="word-count-100-999">100 - 999</T>,
            },
            {
                key: '1000-9999',
                label: <T keyName="word-count-1000-9999">1,000 - 9,999</T>,
            },
            {
                key: '10000-99999',
                label: <T keyName="word-count-10000-99999">10,000 - 99,999</T>,
            },
            {
                key: '100000-999999',
                label: <T keyName="word-count-100000-999999">100,000 - 999,999</T>,
            },
            {
                key: '1000000-*',
                label: <T keyName="word-count-1000000-*">{'>= 1,000,000'}</T>,
            },
        ],
        sort: false,
    },
    ocr: {
        filterLabel: <T keyName="ocred">OCRed</T>,
        chipLabel: <T keyName="ocred">OCRed</T>,
        type: 'term-or',
        sort: true,
    },
    ocrpdf: {
        filterLabel: <T keyName="ocrpdf">OCRed PDF/Office Document</T>,
        chipLabel: <T keyName="ocrpdf">OCRed PDF/Office Document</T>,
        type: 'term-or',
        sort: true,
    },
    ocrimage: {
        filterLabel: <T keyName="ocrimage">OCRed Image</T>,
        chipLabel: <T keyName="ocrimage">OCRed Image</T>,
        type: 'term-or',
        sort: true,
    },
    'detected-objects.object.keyword': {
        filterLabel: <T keyName="detected-objects">Detected objects</T>,
        chipLabel: <T keyName="detected-object">Detected object</T>,
        type: 'term-or',
        sort: true,
    },
    'image-classes.class.keyword': {
        filterLabel: <T keyName="image-classes">Image classes</T>,
        chipLabel: <T keyName="image-class">Image class</T>,
        type: 'term-or',
        sort: true,
    },
    'entity.keyword': {
        filterLabel: <T keyName="entity">Entity</T>,
        chipLabel: <T keyName="entity">Entity</T>,
        type: 'term-or',
        sort: true,
    },
    'entity-type.location.keyword': {
        filterLabel: <T keyName="entity_location">Location entity</T>,
        chipLabel: <T keyName="entity_location">Location entity</T>,
        type: 'term-or',
        sort: true,
    },
    'entity-type.organization.keyword': {
        filterLabel: <T keyName="entity_organization">Organization entity</T>,
        chipLabel: <T keyName="entity_organization">Organization entity</T>,
        type: 'term-or',
        sort: true,
    },
    'entity-type.event.keyword': {
        filterLabel: <T keyName="entity_event">Event entity</T>,
        chipLabel: <T keyName="entity_event">Event entity</T>,
        type: 'term-or',
        sort: true,
    },
    'entity-type.person.keyword': {
        filterLabel: <T keyName="entity_person">Person entity</T>,
        chipLabel: <T keyName="entity_person">Person entity</T>,
        type: 'term-or',
        sort: true,
    },
    'entity-type.money.keyword': {
        filterLabel: <T keyName="entity_money">Money entity</T>,
        chipLabel: <T keyName="entity_money">Money entity</T>,
        type: 'term-or',
        sort: true,
    },
    'translated-from': {
        filterLabel: <T keyName="translated-from">Translated From</T>,
        chipLabel: <T keyName="translated-from">Translated From</T>,
        type: 'term-or',
        sort: true,
    },
    'translated-to': {
        filterLabel: <T keyName="translated-to">Translated To</T>,
        chipLabel: <T keyName="translated-to">Translated To</T>,
        type: 'term-or',
        sort: true,
    },
    'is-table': {
        filterLabel: <T keyName="is-table">Is Table</T>,
        chipLabel: <T keyName="is-table">Is Table</T>,
        type: 'term-or',
        sort: true,
    },
    'table-columns': {
        filterLabel: <T keyName="table-columns">Table Column Name</T>,
        chipLabel: <T keyName="table-columns">Table Column Name</T>,
        type: 'term-or',
        sort: true,
    },
    'table-sheets': {
        filterLabel: <T keyName="table-sheets">Table Sheet Name</T>,
        chipLabel: <T keyName="table-sheets">Table Sheet Name</T>,
        type: 'term-or',
        sort: true,
    },
    'table-row-count': {
        filterLabel: <T keyName="row-count">Row Count</T>,
        chipLabel: <T keyName="table-row-count">Table Row Count</T>,
        type: 'range-or',
        buckets: [
            {
                key: '0-1',
                label: <T keyName="row-count-0-1">0</T>,
            },
            {
                key: '1-9',
                label: <T keyName="row-count-1-9">1 - 9</T>,
            },
            {
                key: '10-99',
                label: <T keyName="row-count-10-99">10 - 99</T>,
            },
            {
                key: '100-999',
                label: <T keyName="row-count-100-999">100 - 999</T>,
            },
            {
                key: '1000-9999',
                label: <T keyName="row-count-1000-9999">1,000 - 9,999</T>,
            },
            {
                key: '10000-99999',
                label: <T keyName="row-count-10000-99999">10,000 - 99,999</T>,
            },
            {
                key: '100000-999999',
                label: <T keyName="row-count-100000-999999">100,000 - 999,999</T>,
            },
            {
                key: '1000000-*',
                label: <T keyName="row-count-1000000-*">{'>= 1,000,000'}</T>,
            },
        ],
        sort: false,
    },
    'table-col-count': {
        filterLabel: <T keyName="col-count">Column Count</T>,
        chipLabel: <T keyName="table-col-count">Table Column Count</T>,
        type: 'range-or',
        buckets: [
            {
                key: '0-1',
                label: <T keyName="col-count-0-1">0</T>,
            },
            {
                key: '1-3',
                label: <T keyName="col-count-1-3">1 - 3</T>,
            },
            {
                key: '4-9',
                label: <T keyName="col-count-4-9">4 - 9</T>,
            },
            {
                key: '10-29',
                label: <T keyName="col-count-10-29">10 - 29</T>,
            },
            {
                key: '30-99',
                label: <T keyName="col-count-30-99">30 - 99</T>,
            },
            {
                key: '100-*',
                label: <T keyName="col-count-100-*">{'>= 100'}</T>,
            },
        ],
        sort: false,
    },
    'table-sheet-count': {
        filterLabel: <T keyName="sheet-count">Sheet Count</T>,
        chipLabel: <T keyName="table-sheet-count">Table Sheet Count</T>,
        type: 'range-or',
        buckets: [
            {
                key: '0-1',
                label: <T keyName="sheet-count-0-1">0</T>,
            },
            {
                key: '1-3',
                label: <T keyName="sheet-count-1-3">1 - 3</T>,
            },
            {
                key: '4-9',
                label: <T keyName="sheet-count-4-9">4 - 9</T>,
            },
            {
                key: '10-29',
                label: <T keyName="sheet-count-10-29">10 - 29</T>,
            },
            {
                key: '30-99',
                label: <T keyName="sheet-count-30-99">30 - 99</T>,
            },
            {
                key: '100-*',
                label: <T keyName="sheet-count-100-*">{'>= 100'}</T>,
            },
        ],
        sort: false,
    },
}
