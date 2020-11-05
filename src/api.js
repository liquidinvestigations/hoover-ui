import path from 'path';
import fetch from 'isomorphic-fetch';
import { memoize } from 'lodash';
import buildSearchQuery from './build-search-query';

const api = {
    prefix: '/api/v0/',

    buildUrl: (...paths) => path.join(api.prefix, ...paths),

    fetchJson: async (url, opts = {}) => {
        const res = await fetch(url, {
            ...opts,
            credentials: 'same-origin',
            headers: {
                ...(opts.headers || {}),
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
        });

        if (res.ok) {
            return res.json();
        } else {
            const body = await res.text();
            const err = new Error(
                `unable to fetch ${res.url}: ${res.status} ${
                    res.statusText
                }\n${body}`
            );

            err.url = res.url;
            err.status = res.status;
            err.statusText = res.statusText;

            throw err;
        }
    },

    collections: () => api.fetchJson(api.buildUrl('collections')),

    limits: () => api.fetchJson(api.buildUrl('limits')),

    // TODO fix the GET query param here (use some URL functions?)
    locationsFor: memoize((docUrl, pageIndex) => api.fetchJson(api.buildUrl(docUrl, 'locations') + '?page=' + pageIndex)),

    // TODO fix the GET query param here too
    doc: memoize((docUrl, pageIndex) => api.fetchJson(api.buildUrl(docUrl, 'json') + '?children_page=' + pageIndex)),

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
