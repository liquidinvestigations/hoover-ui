import { SearchQueryParams, Terms } from '../Types'

import type { ParsedQs } from 'qs'

const SORT_RELEVANCE = 'Relevance'
const SORT_NEWEST = 'Newest'
const SORT_OLDEST = 'Oldest'
const SORT_CREATED_DESCENDING = 'Creation date descending'
const SORT_CREATED_ASCENDING = 'Creation date ascending'
const SORT_SIZE_DESCENDING = 'Size descending'
const SORT_SIZE_ASCENDING = 'Size ascending'
const SORT_WORD_COUNT_DESCENDING = 'Word count descending'
const SORT_WORD_COUNT_ASCENDING = 'Word count ascending'

const SORT_MAPPING: Record<string, string[] | null> = {
    [SORT_RELEVANCE]: null,
    [SORT_NEWEST]: ['date', 'desc'],
    [SORT_OLDEST]: ['date'],
    [SORT_CREATED_DESCENDING]: ['date-created', 'desc'],
    [SORT_CREATED_ASCENDING]: ['date-created'],
    [SORT_SIZE_DESCENDING]: ['size', 'desc'],
    [SORT_SIZE_ASCENDING]: ['size'],
    [SORT_WORD_COUNT_DESCENDING]: ['word-count', 'desc'],
    [SORT_WORD_COUNT_ASCENDING]: ['word-count'],
}

export type QueryParamsType = (SearchQueryParams & Record<string, string | string[] | undefined>) | ParsedQs

const moveToFilters = (query: QueryParamsType, param: string, value?: string) => {
    if (!query.filters) {
        query.filters = {}
    }
    const data: unknown = value || query[param] || []
    if (Array.isArray(data) && data.length) {
        ;(query.filters as Record<string, Terms>)[param] = {
            include: data.filter((v) => !v.startsWith('~')),
            exclude: data.filter((v) => v.startsWith('~')),
        }
    } else {
        ;(query.filters as Record<string, Terms>)[param] = data as Terms
    }
}

export default function fixLegacyQuery(query: QueryParamsType): QueryParamsType {
    processCollections(query)
    processOrder(query)
    processFields(query)
    processPrivateTags(query)
    processNumericValues(query)
    return query
}

const processNumericValues = (query: QueryParamsType) => {
    if (query.dedup_results) return (query.dedup_results = parseInt(query.dedup_results as string))
    if (query.unify_results) return (query.unify_results = parseInt(query.unify_results as string))
}

function processCollections(query: QueryParamsType) {
    if (query.collections && typeof query.collections === 'string') {
        query.collections = query.collections.split('+')
    }
}

function processOrder(query: QueryParamsType) {
    if (query.order && typeof query.order === 'string') {
        query.order = SORT_MAPPING[query.order] || query.order
    }
}

function processFields(query: QueryParamsType) {
    ;['date', 'date-created', 'filetype', 'lang', 'email-domains', 'from.keyword', 'to.keyword', 'path-parts', 'tags'].forEach((field) => {
        if (query[field]) {
            moveToFilters(query, field)
        }
    })
}

function processPrivateTags(query: QueryParamsType) {
    const privateTags = Object.keys(query).filter((tag) => /^priv-tags\./.test(tag))
    privateTags.forEach((tag) => {
        moveToFilters(query, 'priv-tags', query[tag] as string)
    })
}
