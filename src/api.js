import fetch from 'isomorphic-fetch';
import { memoize } from 'lodash';
import { stringify } from 'querystring'
import buildSearchQuery from './build-search-query';

const api = {
    prefix: '/api/v0/',

    buildUrl: (...paths) => {
        const queryObj = paths.reduce((prev, curr, index) => {
            if (typeof curr === 'object') {
                paths.splice(index, 1)
                return Object.assign(prev || {}, curr)
            }
        })
        return [api.prefix, ...paths].join('/').replace(/\/+/g, '/')
            + (queryObj ? `?${stringify(queryObj)}` : '')
    },

    fetchJson: async (url, opts = {}) => {
        const apiUrl = typeof window === 'undefined' ? 'http://' + api.host + url : url
        const res = await fetch(apiUrl, {
            ...opts,
            credentials: 'same-origin',
            headers: {
                ...(opts.headers || {}),
                'Content-Type': 'application/json',
                Accept: 'application/json',
                Cookie: api.cookie,
            },
        });

        if (res.ok) {
            return res.json();
        } else {
            throw await res.json()
        }
    },

    collections: () => api.fetchJson(api.buildUrl('collections')),

    limits: () => api.fetchJson(api.buildUrl('limits')),

    locationsFor: memoize((docUrl, pageIndex) => api.fetchJson(
        api.buildUrl(docUrl, 'locations', { page: pageIndex })
    ), (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`),

    doc: memoize((docUrl, pageIndex) => api.fetchJson(
        api.buildUrl(docUrl, 'json', { children_page: pageIndex })
    ), (docUrl, pageIndex) => `${docUrl}/page/${pageIndex}`),

    whoami: () => api.fetchJson(api.buildUrl('whoami')),

    batch: query => api.fetchJson(api.buildUrl('batch'), {
        method: 'POST',
        body: JSON.stringify(query),
    }),

    search: params => api.fetchJson(api.buildUrl('search'), {
        method: 'POST',
        body: JSON.stringify(buildSearchQuery(params)),
    }),

    downloadUrl: (docUrl, filename) => api.buildUrl(docUrl, 'raw', filename),

    ocrUrl: (docUrl, tag) => api.buildUrl(docUrl, 'ocr', tag)
}

export default api;
