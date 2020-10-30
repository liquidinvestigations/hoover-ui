import path from 'path';
import fetch from 'isomorphic-fetch';
import buildSearchQuery from './build-search-query';

const api = {
    prefix: '/api/v0/',

    buildUrl(...paths) {
        return path.join(api.prefix, ...paths);
    },

    async fetchJson(url, opts = {}) {
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
            return await res.json();
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

    async collections() {
        return await this.fetchJson(api.buildUrl('collections'));
    },

    async limits() {
        return await this.fetchJson(api.buildUrl('limits'));
    },

    async locationsFor(docUrl) {
        return await this.fetchJson(api.buildUrl(docUrl, 'locations'));
    },

    async doc(docUrl) {
        return await this.fetchJson(api.buildUrl(docUrl, 'json'));
    },

    async whoami() {
        return await this.fetchJson(api.buildUrl('whoami'));
    },

    async batch(query) {
        return await this.fetchJson(api.buildUrl('batch'), {
            method: 'POST',
            body: JSON.stringify(query),
        });
    },

    async search(params) {
        const query = buildSearchQuery(params);

        return await this.fetchJson(api.buildUrl('search'), {
            method: 'POST',
            body: JSON.stringify(query),
        });
    },

    downloadUrl(docUrl, filename) {
        return api.buildUrl(docUrl, 'raw', filename);
    },

    ocrUrl(docUrl, tag) {
        return api.buildUrl(docUrl, 'ocr', tag);
    }
}

export default api;
