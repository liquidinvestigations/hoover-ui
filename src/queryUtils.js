import qs from 'qs'
import { aggregationFields } from './components/search/filters/aggregationFields'

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
    b: 'tab',
    a: 'subTab',
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
        collections: params?.collections?.join('+'),
    }))
)

export const clearQuotedParam = param => param.replace(/#/g, ' ').replace(/"/g, '')

export const createSearchParams = (field, term) => {
    const params = {}

    if (aggregationFields[field]) {
        params.q = '*'
        params.filters = {}

        if (aggregationFields[field].type === 'date') {
            const dateOnly = term.substring(0, 10)
            params.filters[field] = { from: dateOnly, to: dateOnly }
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
