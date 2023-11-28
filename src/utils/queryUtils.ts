import { DateTime } from 'luxon'
import qs, { ParsedQs } from 'qs'

import { aggregationFields } from '../constants/aggregationFields'
import { HashState } from '../stores/HashStateStore'
import { Interval, SearchQueryParams, SourceField, Terms } from '../Types'

import { daysInMonth } from './utils'

export const defaultSearchParams = {
    page: 1,
    size: 10,
}

const PARAMS_MAP: Record<string, string> = {
    q: 'q',
    c: 'collections',
    p: 'page',
    s: 'size',
    o: 'order',
    t: 'facets',
    i: 'filters',
    v: 'preview',
    h: 'histogram',
    b: 'tab',
    a: 'subTab',
    g: 'previewPage',
    x: 'excludedFields',
    ct: 'chunkTab',
    fq: 'findQuery',
    fi: 'findIndex',
}

const LEGACY_PARAMS: Record<string, string> = {
    ...PARAMS_MAP,
    d: 'date',
    r: 'date-created',
    f: 'filetype',
    l: 'lang',
    e: 'email-domains',
}

export const rollupParams = (query: HashState) =>
    Object.fromEntries(
        Object.entries(query).map(([field, value]) => {
            const key = Object.keys(PARAMS_MAP).find((keyE) => PARAMS_MAP[keyE] === field)
            return key ? [key, value] : [field, value]
        }),
    )

export const unwindParams = (query: ParsedQs) =>
    Object.fromEntries(Object.entries(query).map(([field, value]) => (LEGACY_PARAMS[field] ? [LEGACY_PARAMS[field], value] : [field, value])))

export const buildSearchQuerystring = (params: Partial<SearchQueryParams>) =>
    qs.stringify(
        rollupParams({
            ...defaultSearchParams,
            ...params,
            collections: params?.collections?.join?.('+'),
        }),
    )

export const clearQuotedParam = (param: string) => param.replace(/#/g, ' ').replace(/"/g, '')

export interface Term {
    term: string
    format: string
    interval?: Interval
}

export const createSearchParams = (term: string | Term, field?: SourceField) => {
    const params: Partial<SearchQueryParams> = {}

    if (field && aggregationFields[field]) {
        params.q = '*'
        params.filters = {}

        if (aggregationFields[field]?.type === 'date' && typeof term === 'object') {
            params.filters[field] = getSearchFilter(term)
            if (term.interval) {
                params.filters[field].interval = term.interval
            }
        } else {
            params.filters[field] = { include: [term as SourceField] }
        }
    } else if (field && typeof term === 'string') {
        params.q = `${field}:"${clearQuotedParam(term)}"`
    } else if (typeof term === 'string') {
        params.q = term
    }

    return params
}

const getSearchFilter = (term: Term): Partial<Terms> => {
    const year = term.term.substring(0, 4)
    const month = term.term.substring(0, 7)
    const week = term.term.substring(0, 10)
    const dateTime = DateTime.fromISO(week)
    const day = term.term.substring(0, 10)

    switch (term.format) {
        case 'year':
            return {
                from: `${year}-01-01`,
                to: `${year}-12-31`,
            }
            break

        case 'month':
            return {
                from: `${month}-01`,
                to: `${month}-${daysInMonth(month)}`,
            }
            break

        case 'week':
            return {
                from: DateTime.fromObject({
                    weekYear: dateTime.weekYear,
                    weekNumber: dateTime.weekNumber,
                    weekday: 1,
                }).toISODate(),
                to: DateTime.fromObject({
                    weekYear: dateTime.weekYear,
                    weekNumber: dateTime.weekNumber,
                    weekday: 7,
                }).toISODate(),
            }
            break

        default:
            return {
                from: day,
                to: day,
            }
    }
}

export const createSearchUrl = (term: Term | string, collections: string | string[], field?: SourceField, hash?: HashState) => {
    const params = createSearchParams(term, field)
    const hashParams = hash ? '#' + qs.stringify(rollupParams(hash)) : ''

    params.collections = Array.isArray(collections) ? collections : [collections]

    return `/?${buildSearchQuerystring(params)}${hashParams}`
}
