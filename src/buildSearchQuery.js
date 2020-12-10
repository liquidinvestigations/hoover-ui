import { DEFAULT_FACET_SIZE, DEFAULT_INTERVAL } from './constants'
import { DateTime } from 'luxon'

// remove this list from here
const ALL_FIELDS = [
    'attachments',
    'broken',
    'content-type',
    'date',
    'date-created',
    'email-domains',
    'email.*',
    'filename',
    'filetype',
    'from',
    'id',
    'in-reply-to',
    'lang',
    'location',
    'md5',
    'message',
    'message-id',
    'ocr',
    'ocrimage',
    'ocrpdf',
    'ocrtext.*',
    'path',
    'path-parts',
    'path-text',
    'pgp',
    'references',
    'rev',
    'sha1',
    'size',
    'subject',
    'text',
    'thread-index',
    'to',
    'word-count',

    'tags',
    // FIXME the api route returns username here
    "private-tags.root",
];


const HIGHLIGHT_SETTINGS = {
    fragment_size: 150,
    number_of_fragments: 3,
    require_field_match: false,
    pre_tags: ['<mark>'],
    post_tags: ['</mark>'],
};

function buildQuery(q = '*', { dateRange, dateCreatedRange }) {
    const qs = {
        query_string: {
            query: q,
            default_operator: 'AND',
            // TODO replace with fields.all from api.searchFields()
            fields: ALL_FIELDS,
            lenient: true,
        },
    }

    const ranges = [];
    ['date', 'date-created'].forEach(field => {
        const value = params[field]
        if (value?.from && value?.to) {
            ranges.push({
                range: {
                    [field]: {
                        gte: value.from,
                        lte: value.to,
                    },
                },
            })
        }
    })

    if (ranges.length) {
        return {
            bool: {
                must: [qs, ...ranges],
            },
        }
    }

    return qs
}

const buildSortQuery = order => order?.reverse().map(([field, direction = 'asc']) => field.startsWith('_') ?
    {[field]: {order: direction}} :
    {[field]: {order: direction, missing: '_last'}}
) || []

const buildTermsField = (field, terms, size = DEFAULT_FACET_SIZE) => ({
    field,
    aggregation: {
        terms: { field, size },
    },
    filterClause: terms?.length ? {
        terms: { [field]: terms },
    } : null,
})

const daysInMonth = interval => {
    const [, year, month] = /(\d{4})-(\d{2})/.exec(interval)
    return new Date(year, month, 0).getDate()
}

const intervalFormat = (interval, param) => {
    switch (interval) {
        case 'year':
            return {
                gte: `${param}-01-01`,
                lte: `${param}-12-31`,
            }

        case 'month':
            return {
                gte: `${param}-01`,
                lte: `${param}-${daysInMonth(param)}`,
            }

        case 'week':
            return {
                gte: param,
                lt: DateTime.fromISO(param).plus({days: 7}).toISODate()
            }

        case 'day':
            return {
                gte: param,
                lte: param,
            }

        case 'hour':
            return {
                gte: `${param}:00:00.000Z`,
                lte: `${param}:59:59.999Z`,
            }
    }
}

const buildHistogramField = (field, { interval = DEFAULT_INTERVAL, intervals = [] } = {}) => ({
    field,
    aggregation: {
        date_histogram: {
            field,
            interval,
        },
    },
    filterClause: intervals.length ? {
        bool: {
            should: intervals.map(selected => ({
                range: {
                    [field]: intervalFormat(interval, selected),
                },
            })),
        },
    } : null,
})

const buildFilter = fields => {
    const must = fields.map(field => field.filterClause).filter(Boolean)

    if (must.length) {
        return {
            bool: {
                must,
            },
        }
    } else {
        return { bool: {} }
    }
}

const buildAggs = fields => fields.reduce((result, field) => ({
    ...result,
    [field.field]: {
        aggs: {
            values: field.aggregation,
            count: { cardinality: { field: field.field } },
        },
        filter: buildFilter(
            fields.filter(other => other.field !== field.field)
        ),
    },
}), {})

const buildSearchQuery = params => {
    const { page = 1, size = 0, order, collections = [], facets = {} } = params
    const query = buildQuery(params)
    const sort = buildSortQuery(order)

    const fields = [
        ...['lang', 'filetype', 'email-domains'].map(field =>
            buildTermsField(field, params[field], facets[field])
        ),
        ...['date', 'date-created'].map(field =>
            buildHistogramField(field, params[field]),
        ),
    ]

    const postFilter = buildFilter(fields);
    const aggs = buildAggs(fields);

    const highlightFields = {};
    // TODO replace with fields.highlight from api.searchFields()
    ALL_FIELDS.forEach((x) => {
        highlightFields[x] = HIGHLIGHT_SETTINGS;
    });

    return {
        from: (page - 1) * size,
        size,
        query,
        sort,
        post_filter: postFilter,
        aggs,
        collections,
        // TODO replace with fields._source from api.searchFields()
        _source: ALL_FIELDS,
        highlight: {
            fields: highlightFields,
        },
    }
}

export default buildSearchQuery
