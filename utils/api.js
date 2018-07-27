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

function buildPostFilter(filters) {
    const clauses = Object.entries(filters)
        .filter(([key, value]) => value && value.length)
        .map(([key, value]) => {
            if (key === 'dateYears') {
                return {
                    bool: {
                        should: value.map(year => ({
                            range: {
                                date: { gte: `${year}-01-01`, lte: `${year}-12-31` },
                            },
                        })),
                    },
                };
            } else if (key === 'dateCreatedYears') {
                return {
                    bool: {
                        should: value.map(year => ({
                            range: {
                                'date-created': {
                                    gte: `${year}-01-01`,
                                    lte: `${year}-12-31`,
                                },
                            },
                        })),
                    },
                };
            } else {
                throw new Error(`unknown filter: ${JSON.stringify({ key, value })}`);
            }
        });

    if (clauses.length) {
        return { bool: { must: clauses } };
    } else {
        return {};
    }
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
        const body = await res.text();
        const err = new Error(
            `unable to fetch ${res.url}: ${res.status} ${res.statusText}\n${body}`
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
        dateYears = null,
        dateCreatedYears = null,
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
                    count_by_date_year: {
                        date_histogram: {
                            field: 'date',
                            interval: 'year',
                        },
                    },
                    count_by_date_created_year: {
                        date_histogram: {
                            field: 'date-created',
                            interval: 'year',
                        },
                    },
                },
                collections: collections,
                fields: [
                    'path',
                    'url',
                    'mime_type',
                    'attachments',
                    'filename',
                    'word-count',
                    'date',
                    'date-created',
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
