import { DEFAULT_FACET_SIZE, DEFAULT_INTERVAL, HIGHLIGHT_SETTINGS } from '../constants'
import { DateTime } from 'luxon'

const buildQuery = ({ q = '*', ...rest }, searchFields) => {
    const qs = {
        query_string: {
            query: q,
            default_operator: 'AND',
            fields: searchFields.all,
            lenient: true,
        },
    }

    const ranges = [];
    ['date', 'date-created'].forEach(field => {
        const value = rest[field]
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

const buildTermsField = (field, terms, page = 1, size = DEFAULT_FACET_SIZE) => {
    const includeTerms = terms?.filter(term => !term.startsWith('!'))
    const excludeTerms = terms?.filter(term => term.startsWith('!')).map(term => term.substring(1))
    return {
        field,
        aggregation: {
            terms: { field, size: page * size },
        },
        filterClause: includeTerms?.length ? {
            terms: { [field]: includeTerms },
        } : null,
        filterExclude: excludeTerms?.length ? {
            terms: { [field]: excludeTerms },
        } : null,
    }
}

const daysInMonth = param => {
    const [, year, month] = /(\d{4})-(\d{2})/.exec(param)
    return new Date(year, month, 0).getDate()
}

const intervalFormat = (interval, param) => {
    switch (interval) {
        case 'year':
            return {
                gte: `${param}-01-01T00:00:00.000Z`,
                lte: `${param}-12-31T23:59:59.999Z`,
            }

        case 'month':
            return {
                gte: `${param}-01T00:00:00.000Z`,
                lte: `${param}-${daysInMonth(param)}T23:59:59.999Z`,
            }

        case 'week':
            return {
                gte: `${param}T00:00:00.000Z`,
                lt: `${DateTime.fromISO(param).plus({days: 7}).toISODate()}T23:59:59.999Z`,
            }

        case 'day':
            return {
                gte: `${param}T00:00:00.000Z`,
                lte: `${param}T23:59:59.999Z`,
            }

        case 'hour':
            return {
                gte: `${param}:00:00.000Z`,
                lte: `${param}:59:59.999Z`,
            }
    }
}

const buildHistogramField = (field, { interval = DEFAULT_INTERVAL, intervals = [] } = {},
                             page = 1, size = DEFAULT_FACET_SIZE) => ({
    field,
    aggregation: {
        date_histogram: {
            field,
            interval,
            min_doc_count: 1,
            order: { '_key': 'desc' },
        },
        aggs: {
            bucket_truncate: {
                bucket_sort: {
                    from: (page - 1) * size,
                    size
                }
            }
        }
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
    const must_not = fields.map(field => field.filterExclude).filter(Boolean)

    if (must.length || must_not.length) {
        return {
            bool: {
                must,
                must_not,
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

const buildSearchQuery = ({ page = 1, size = 0, order, collections = [], facets = {}, ...rest } = {},
                          type, searchFields, username) => {

    const query = buildQuery(rest, searchFields)
    const sort = buildSortQuery(order)

    const fields = [
        ...['date', 'date-created'].map(field =>
            buildHistogramField(field, rest[field], facets[field]),
        ),
        ...['tags', `private-tags.${username}.keyword`, 'filetype', 'lang', 'email-domains'].map(field =>
            buildTermsField(field, rest[field], facets[field])
        ),
    ]

    const postFilter = buildFilter(fields);
    const aggs = buildAggs(fields);

    const highlightFields = {}
    searchFields.highlight.forEach(field => {
        highlightFields[field] = HIGHLIGHT_SETTINGS
    })

    return {
        from: (page - 1) * size,
        size: type === 'aggregations' ? 0 : size,
        query,
        sort,
        post_filter: postFilter,
        aggs: type === 'results' ? {} : aggs,
        collections,
        _source: searchFields._source,
        highlight: {
            fields: highlightFields,
        },
    }
}

export default buildSearchQuery
