import { DateTime } from 'luxon'
import {
    DEFAULT_FACET_SIZE,
    DEFAULT_INTERVAL,
    DEFAULT_OPERATOR,
    HIGHLIGHT_SETTINGS,
    PRIVATE_FIELDS,
} from '../constants/general'
import { daysInMonth } from '../utils'
import { aggregationFields } from '../constants/aggregationFields'

const expandPrivate = (field, uuid) => {
    if (PRIVATE_FIELDS.includes(field)) {
        return `${field}.${uuid}`
    }
    return field
}

const buildQuery = (q, filters, searchFields) => {
    const qs = {
        query_string: {
            query: q,
            default_operator: DEFAULT_OPERATOR,
            fields: searchFields.all,
            lenient: true,
        },
    }

    const ranges = [];
    ['date', 'date-created'].forEach(field => {
        const value = filters[field]
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

const buildTermsField = (field, uuid, terms, page = 1, missing) => {
    const fieldKey = expandPrivate(field, uuid)

    let filterMissing = null
    let filterClause = null
    if (terms?.include?.length) {
        const include = terms.include.filter(term => term !== missing)
        if (include.length) {
            if (aggregationFields[field].type === 'term-and') {
                filterClause = include.map(term => ({
                    term: {[fieldKey]: term}
                }))
            } else {
                filterClause = {
                    terms: {[fieldKey]: include},
                }
            }
        }

        if (terms.include.includes(missing)) {
            filterMissing = false
        }
    }

    let filterExclude = null
    if (terms?.exclude?.length) {
        const exclude = terms.exclude.filter(term => term !== missing)
        if (exclude.length) {
            filterExclude = {
                terms: { [fieldKey]: exclude },
            }
        }

        if (terms.exclude.includes(missing)) {
            filterMissing = true
        }
    }

    if (field === 'tags' && !terms?.include?.includes('trash') && !terms?.exclude?.includes('trash')) {
        if (filterExclude === null) {
            filterExclude = { terms: { [fieldKey]: ['trash'] } }
        } else {
            filterExclude.terms[fieldKey].push('trash')
        }
    }

    return {
        field,
        aggregation: {
            terms: {
                field: fieldKey, size: page * DEFAULT_FACET_SIZE,
                missing,
            },
        },
        filterClause,
        filterExclude,
        filterMissing,
    }
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

const buildHistogramField = (field, username, { interval = DEFAULT_INTERVAL, intervals = [] } = {},
                             page = 1, size = DEFAULT_FACET_SIZE) => ({
    field,
    aggregation: {
        date_histogram: {
            field: expandPrivate(field, username),
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
    filterClause: intervals.include?.length ? {
        bool: {
            should: intervals.include.map(selected => ({
                range: {
                    [expandPrivate(field, username)]: intervalFormat(interval, selected),
                },
            })),
        },
    } : null,
})

const buildMissingField = field => ({
    field: `${field}-missing`,
    aggregation: {
        missing: { field },
    }
})

const buildFilter = fields => {
    const filter = fields.map(field => field.filterClause).filter(Boolean)
    const must_not = fields.map(field => field.filterExclude).filter(Boolean)

    fields.forEach(field => {
        if (typeof field.filterMissing === 'boolean') {
            const exists = { exists: { field: field.field } }
            if (field.filterMissing) {
                filter.push(exists)
            } else {
                must_not.push(exists)
            }
        }
    })

    if (filter.length || must_not.length) {
        return {
            bool: {
                filter,
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

const buildSearchQuery = (
    {
        q = '*',
        page = 1,
        size = 0,
        order,
        collections = [],
        facets = {},
        filters = {},
        missing,
    } = {},
    type,
    searchFields,
    uuid
) => {

    const query = buildQuery(q, filters, searchFields)
    const sort = buildSortQuery(order)

    const dateFields = Object.entries(aggregationFields)
        .filter(([,field]) => field.type === 'date')
        .map(([key]) => key)

    const termFields = Object.entries(aggregationFields)
        .filter(([,field]) => field.type.startsWith('term'))
        .map(([key]) => key)

    const fields = [
        ...dateFields.map(field => buildHistogramField(field, uuid, filters[field], facets[field])),
        ...dateFields.map(buildMissingField),
        ...termFields.map(field => buildTermsField(field, uuid, filters[field], facets[field], missing)),
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
