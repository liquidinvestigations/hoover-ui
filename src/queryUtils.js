import qs from 'qs'
import { DateTime } from 'luxon'
import { daysInMonth } from './utils'
import { aggregationFields } from './constants/aggregationFields'

export const defaultSearchParams = {
    page: 1,
    size: 10,
}

const PARAMS_MAP = {
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
    k: 'allBuckets',
}

const LEGACY_PARAMS = {
    ...PARAMS_MAP,
    d: 'date',
    r: 'date-created',
    f: 'filetype',
    l: 'lang',
    e: 'email-domains',
}

export const rollupParams = query => Object.fromEntries(Object.entries(query).map(([field, value]) => {
    const key = Object.keys(PARAMS_MAP).find(key => PARAMS_MAP[key] === field)
    return key ? [key, value] : [field, value]
}))

export const unwindParams = query => Object.fromEntries(Object.entries(query).map(([field, value]) =>
    LEGACY_PARAMS[field] ? [LEGACY_PARAMS[field], value] : [field, value])
)

export const buildSearchQuerystring = (params) => (
    qs.stringify(rollupParams({
        ...defaultSearchParams, ...params,
        collections: params?.collections?.join?.('+'),
    }))
)

export const clearQuotedParam = param => param.replace(/#/g, ' ').replace(/"/g, '')

export const createSearchParams = (field, term) => {
    const params = {}

    if (aggregationFields[field]) {
        params.q = '*'
        params.filters = {}

        if (aggregationFields[field].type === 'date') {
            switch (term.format) {
                case 'year':
                    const year = term.term.substring(0, 4)
                    params.filters[field] = {
                        from: `${year}-01-01`,
                        to: `${year}-12-31`,
                    }
                    break

                case 'month':
                    const month = term.term.substring(0, 7)
                    params.filters[field] = {
                        from: `${month}-01`,
                        to: `${month}-${daysInMonth(month)}`,
                    }
                    break

                case 'week':
                    const week = term.term.substring(0, 10)
                    const dateTime = DateTime.fromISO(week)
                    params.filters[field] = {
                        from: DateTime.fromObject({
                                weekYear: dateTime.weekYear,
                                weekNumber: dateTime.weekNumber,
                                weekday: 1
                            }).toISODate(),
                        to: DateTime.fromObject({
                                weekYear: dateTime.weekYear,
                                weekNumber: dateTime.weekNumber,
                                weekday: 7
                            }).toISODate(),
                    }
                    break

                case 'day':
                    const day = term.term.substring(0, 10)
                    params.filters[field] = {
                        from: day,
                        to: day,
                    }
            }

            if (term.interval) {
                params.filters[field].interval = term.interval
            }

        } else {
            params.filters[field] = { include: [term] }
        }

    } else if (field) {
        params.q = `${field}:"${clearQuotedParam(term)}"`
    } else {
        params.q = term
    }

    return params
}

export const createSearchUrl = (term, field, collections, hash) => {
    const params = createSearchParams(field, term)
    const hashParams = hash ? '#' + qs.stringify(rollupParams(hash)) : ''

    params.collections = Array.isArray(collections) ? collections : [collections]

    return `/?${buildSearchQuerystring(params)}${hashParams}`
}
