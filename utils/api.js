import fetch from 'isomorphic-fetch';
import { SORT_RELEVANCE, SORT_NEWEST, SORT_OLDEST } from './constants';
import NProgress from 'nprogress';

NProgress.configure({ parent: '.nprogress', showSpinner: true });

function buildQuery(q) {
    return {
        query_string: {
            query: q,
            default_operator: 'AND',
        },
    };
}

function buildSortQuery(order) {
    var sort = ['_score', '_id'];
    switch (order) {
        case SORT_NEWEST:
            sort = [{ date: { order: 'desc' } }, ...sort];
            break;
        case SORT_OLDEST:
            sort = [{ date: { order: 'asc' } }, ...sort];
            break;
    }
    return sort;
}

async function fetchJson(url, opts = {}) {
    NProgress.start();

    const res = await fetch(url, {
        ...opts,
        credentials: 'same-origin',
        headers: {
            ...(opts.headers || {}),
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
    });

    NProgress.done();

    if (res.ok) {
        return await res.json();
    } else {
        const err = new Error(
            `unable to fetch ${res.url}: ${res.status} ${res.statusText}`
        );

        err.url = res.url;
        err.status = res.status;
        err.statusText = res.statusText;

        throw err;
    }
}

class Api {
    async collections() {
        return await fetchJson('/collections');
    }

    async limits() {
        return await fetchJson('/limits');
    }

    async locationsFor(docUrl) {
        return await fetchJson(`${docUrl}/locations`);
    }

    async doc(docUrl) {
        return await fetchJson(`${docUrl}/json`);
    }

    async whoami() {
        return await fetchJson('/whoami');
    }

    async batch(query) {
        return await fetchJson('/batch', {
            method: 'POST',
            body: JSON.stringify(query),
        });
    }

    async search({
        page = 1,
        size = 0,
        q = '*',
        order = SORT_RELEVANCE,
        collections = [],
        searchAfter = '',
    } = {}) {
        return await fetchJson('/search', {
            method: 'POST',
            body: JSON.stringify({
                from: (page - 1) * size,
                size: size,
                query: buildQuery(q),
                search_after: searchAfter,
                sort: buildSortQuery(order),
                aggs: {
                    count_by_filetype: { terms: { field: 'filetype' } },
                },
                collections: collections,
                fields: [
                    'path',
                    'url',
                    'mime_type',
                    'attachments',
                    'filename',
                    'word-count',
                ],
                highlight: {
                    fields: {
                        '*': {
                            fragment_size: 150,
                            number_of_fragments: 3,
                            require_field_match: false,
                            pre_tags: ['<mark>'],
                            post_tags: ['</mark>'],
                        },
                    },
                },
            }),
        });
    }
}

export default new Api();
