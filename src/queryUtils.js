import qs from 'qs'
import { PRIVATE_FIELDS, SEARCH_DATE, SEARCH_DATE_CREATED } from './constants'

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

export const buildSearchQuerystring = ({ q, size, order, page, collections, facets, filters }) => (
    qs.stringify(rollupParams({
        ...defaultSearchParams,
        q, size, order, page, facets, filters,
        collections: collections?.join('+'),
    }))
)

export const searchPath = (query, prefix, collections) => {
    let quotedQuery = query.replace(/#/g, ' ').replace(/"/g, '')

    if (/[\s\/]/g.test(quotedQuery)) {
        quotedQuery = `"${quotedQuery}"`
    }

    const params = { collections: Array.isArray(collections) ? collections : [collections] }

    if (prefix === SEARCH_DATE || prefix === SEARCH_DATE_CREATED) {
        params.q = '*'
        quotedQuery = quotedQuery.substring(0, 10)
        if (!params.filters) {
            params.filters = {}
        }
        params.filters[prefix] = { from: quotedQuery, to: quotedQuery }
    } else if (prefix) {
        params.q = `${prefix}:${quotedQuery}`
    } else {
        params.q = quotedQuery
    }

    return `/?${buildSearchQuerystring(params)}`
}
