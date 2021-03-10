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

const buildTermsField = (field, uuid, terms, page = 1, size = DEFAULT_FACET_SIZE) => {
    const fieldKey = expandPrivate(field, uuid)

    let filterClause = null
    if (terms?.include?.length) {
        if (aggregationFields[field].type === 'term-and') {
            filterClause = terms.include.map(term => ({
                term: {[fieldKey]: term}
            }))
        } else {
            filterClause = {
                terms: {[fieldKey]: terms.include},
            }
        }
    }

    let filterExclude = null
    if (terms?.exclude?.length) {
        filterExclude = {
            terms: { [fieldKey]: terms.exclude },
        }
    }

    let filterMissing = null
    if (terms?.missing === 'true') {
        filterMissing = false
    } else if (terms?.missing === 'false') {
        filterMissing = true
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
                field: fieldKey,
                size: page * size,
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

const buildHistogramField = (field, uuid, { interval = DEFAULT_INTERVAL, intervals } = {},
                             page = 1, size = DEFAULT_FACET_SIZE) => {

    const fieldKey = expandPrivate(field, uuid)

    let filterClause = null
    if (intervals?.include?.length) {
        filterClause = {
            bool: {
                should: intervals.include.map(selected => ({
                    range: {
                        [fieldKey]: intervalFormat(interval, selected),
                    },
                })),
            },
        }
    }

    let filterMissing = null
    if (intervals?.missing === 'true') {
        filterMissing = false
    } else if (intervals?.missing === 'false') {
        filterMissing = true
    }

    return {
        field,
        aggregation: {
            date_histogram: {
                field: fieldKey,
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
        filterClause,
        filterMissing,
    }
}

const buildMissingField = (field, uuid) => ({
    field: `${field}-missing`,
    aggregation: {
        missing: { field: expandPrivate(field, uuid) },
    }
})

const buildFilter = fields => {
    const should = []
    const filter = fields.map(field => field.filterClause).filter(Boolean)
    const must_not = fields.map(field => field.filterExclude).filter(Boolean)

    fields.forEach(field => {
        if (typeof field.filterMissing === 'boolean') {
            const exists = { exists: { field: field.field } }
            if (aggregationFields[field.field].type === 'term-and') {
                if (field.filterMissing) {
                    filter.push(exists)
                } else {
                    must_not.push(exists)
                }
            } else {
                if (field.filterMissing) {
                    should.push(exists)
                } else {
                    should.push({ bool: { must_not: exists } })
                }
                if (filter.length) {
                    should.push(filter.pop())
                }
            }
        }
    })

    if (should.length || filter.length || must_not.length) {
        return {
            bool: {
                should,
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
            fields.filter(other =>
                other.field !== field.field &&
                other.field !== `${field.field}-missing` &&
                field.field !== `${other.field}-missing`
            )
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
    } = {},
    type,
    searchFields,
    uuid
) => {
    try{
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
        ...dateFields.map(field => buildMissingField(field, uuid)),
        ...termFields.map(field => buildTermsField(field, uuid, filters[field], facets[field])),
        ...termFields.map(field => buildMissingField(field, uuid)),
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
    } catch(e) { console.log(e)}
}

export default buildSearchQuery
