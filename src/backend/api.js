import fetch from 'node-fetch'
import { stringify } from 'qs'
import buildSearchQuery from './buildSearchQuery'

const api = {
    prefix: '/api/v0/',

    buildUrl: (...paths) => {
        const queryObj = paths.reduce((prev, curr, index) => {
            if (typeof curr !== 'string' && typeof curr === 'object' && curr !== null) {
                paths.splice(index, 1)
                return Object.assign(prev || {}, curr)
            }
        }, undefined)
        return [api.prefix, ...paths].join('/').replace(/\/+/g, '/')
            + (queryObj ? `?${stringify(queryObj)}` : '')
    },

    fetchJson: async (url, opts = {}) => {
        const res = await fetch(process.env.API_URL + url, {
            ...opts,
            timeout: 60000,
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Cookie: api.headers.cookie,
                ...Object.fromEntries(
                    Object.keys(api.headers)
                        .filter(key => key.startsWith('x-forwarded'))
                        .map(key => [key, api.headers[key]])
                )
            },
        })

        if (res.ok) {
            return res.json();
        } else {
            throw await res.json()
        }
    },

    collections: () => api.fetchJson(api.buildUrl('collections')),

    limits: () => api.fetchJson(api.buildUrl('limits')),

    whoami: () => api.fetchJson(api.buildUrl('whoami')),

    doc: (docUrl, pageIndex = 1) => api.fetchJson(
        api.buildUrl(docUrl, 'json', { children_page: pageIndex })
    ),

    locations: (docUrl, pageIndex) => api.fetchJson(
        api.buildUrl(docUrl, 'locations', { page: pageIndex })
    ),

    search: (params, type) => api.fetchJson(api.buildUrl('search'), {
        method: 'POST',
        body: JSON.stringify(buildSearchQuery(params, type)),
    }),

    batch: query => api.fetchJson(api.buildUrl('batch'), {
        method: 'POST',
        body: JSON.stringify(query),
    }),

    downloadUrl: (docUrl, filename) => api.buildUrl(docUrl, 'raw', filename),

    ocrUrl: (docUrl, tag) => api.buildUrl(docUrl, 'ocr', tag),
}

export default api
