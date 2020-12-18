import qs from 'qs'
import { SEARCH_DATE, SEARCH_DATE_CREATED } from './constants'

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
    d: 'date',
    r: 'date-created',
    f: 'filetype',
    l: 'lang',
    e: 'email-domains',
    t: 'facets',
}

export const rollupParams = query => Object.fromEntries(Object.entries(query).map(([field, value]) => {
    const key = Object.keys(PARAMS_MAP).find(key => PARAMS_MAP[key] === field)
    return key ? [key, value] : [field, value]
}))

export const unwindParams = query => Object.fromEntries(Object.entries(query).map(([field, value]) =>
    PARAMS_MAP[field] ? [PARAMS_MAP[field], value] : [field, value])
)

export const buildSearchQuerystring = ({ q, collections, fields, text, ...rest }) => (
    qs.stringify(rollupParams({
        q: (fields?.length ? fields.join(' ') + ' ' : '') + (text || ''),
        ...defaultSearchParams,
        collections: collections.join('+'),
        ...rest,
    }))
)

export const searchPath = (query, prefix, collections) => {
    let quotedQuery = query.replace(/#/g, ' ').replace(/"/g, '')

    if (/[\s\/]/g.test(quotedQuery)) {
        quotedQuery = `"${quotedQuery}"`
    }

    const params = { collections: Array.isArray(collections) ? collections : [collections] }

    if (prefix === SEARCH_DATE || prefix === SEARCH_DATE_CREATED) {
        params.text = '*'
        quotedQuery = quotedQuery.substring(0, 10)
        if (prefix === SEARCH_DATE) {
            params.dateRange = { from: quotedQuery, to: quotedQuery }
        } else {
            params.dateCreatedRange = { from: quotedQuery, to: quotedQuery }
        }
    } else if (prefix) {
        params.fields = [`${prefix}:${quotedQuery}`]
    } else {
        params.text = quotedQuery
    }

    return `/?${buildSearchQuerystring(params)}`
}
