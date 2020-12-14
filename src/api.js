import fetch from 'isomorphic-fetch'
import memoize from 'lodash/memoize'
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
        let apiUrl = url
        if (typeof window === 'undefined') {
            if (process.env.API_URL) {
                apiUrl = process.env.API_URL + url
            } else if (process.env.ALLOW_CLIENT_API_URL) {
                apiUrl = 'http://' + api.headers.host + url
            }
        }
        const res = await fetch(apiUrl, {
            ...opts,
            credentials: 'same-origin',
            timeout: 60000,
            headers: {
                ...(opts.headers || {}),
                ...(api.headers || {}),
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        })

        if (res.ok) {
            return res.json();
        } else {
            throw await res.json()
        }
    },

    collections: () => api.fetchJson(api.buildUrl('collections')),

    searchFields: () => api.fetchJson(api.buildUrl('search_fields')),

    limits: () => api.fetchJson(api.buildUrl('limits')),

    locationsFor: memoize((docUrl, pageIndex) => api.fetchJson(
        api.buildUrl(docUrl, 'locations', { page: pageIndex })
    ), (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`),

    doc: memoize((docUrl, pageIndex = 1) => api.fetchJson(
        api.buildUrl(docUrl, 'json', { children_page: pageIndex })
    ), (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`),

    whoami: () => api.fetchJson(api.buildUrl('whoami')),

    batch: query => api.fetchJson(api.buildUrl('batch'), {
        method: 'POST',
        body: JSON.stringify(query),
    }),

    search: (params, type) => api.fetchJson(api.buildUrl('search'), {
        method: 'POST',
        body: JSON.stringify(buildSearchQuery(params, type)),
    }),

    downloadUrl: (docUrl, filename) => api.buildUrl(docUrl, 'raw', filename),

    ocrUrl: (docUrl, tag) => api.buildUrl(docUrl, 'ocr', tag)
}

export default api
