import fetch from 'isomorphic-fetch';
import buildSearchQuery from './build-search-query';
import { getBasePath } from './utils';

class Api {
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
    }

    async collections() {
        return await this.fetchJson('/api/v0/collections');
    }

    async limits() {
        return await this.fetchJson('/api/v0/limits');
    }

    async locationsFor(docUrl) {
        return await this.fetchJson(`/api/v0/${docUrl}/locations`);
    }

    async doc(docUrl) {
        return await this.fetchJson(`/api/v0/${docUrl}/json`);
    }

    async whoami() {
        return await this.fetchJson('/api/v0/whoami');
    }

    async batch(query) {
        return await this.fetchJson('/api/v0/batch', {
            method: 'POST',
            body: JSON.stringify(query),
        });
    }

    async search(params) {
        const query = buildSearchQuery(params);

        return await this.fetchJson('/api/v0/search', {
            method: 'POST',
            body: JSON.stringify(query),
        });
    }
}

export default new Api();
