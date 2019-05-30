import fetch from 'isomorphic-fetch';
import buildSearchQuery from './build-search-query';
import { memoize } from 'lodash';

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
        return await this.fetchJson('/collections');
    }

    async limits() {
        return await this.fetchJson('/limits');
    }

    locationsFor = memoize(async docUrl => {
        return await this.fetchJson(`${docUrl}/locations`);
    });

    doc = memoize(async docUrl => {
        return await this.fetchJson(`${docUrl}/json`);
    });

    async whoami() {
        return await this.fetchJson('/whoami');
    }

    async batch(query) {
        return await this.fetchJson('/batch', {
            method: 'POST',
            body: JSON.stringify(query),
        });
    }

    async search(params) {
        const query = buildSearchQuery(params);

        return await this.fetchJson('/search', {
            method: 'POST',
            body: JSON.stringify(query),
        });
    }
}

export default new Api();
