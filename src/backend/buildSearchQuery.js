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
        }
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
                    }
                }
            })
        }
    })

    if (ranges.length) {
        return {
            bool: {
                must: [qs, ...ranges]
            }
        }
    }

    return qs
}

const buildSortQuery = order => order?.reverse().map(([field, direction = 'asc']) => field.startsWith('_') ?
    {[field]: {order: direction}} :
    {[field]: {order: direction, missing: '_last'}}
) || []

const buildTermsField = (field, uuid, terms, page = 1, all = false, size = DEFAULT_FACET_SIZE) => {
    const fieldKey = expandPrivate(field, uuid)

    const aggregation = all ? {
        composite: {
            size: page * size,
            sources: [{
                document: {
                    terms: {
                        field: fieldKey,
                    }
                }
            }]
        }
    } : {
        terms: {
            field: fieldKey,
            size: page * size,
        }
    }

    let filterClause = null
    if (terms?.include?.length) {
        if (aggregationFields[field].type === 'term-and') {
            filterClause = terms.include.map(term => ({
                term: {[fieldKey]: term}
            }))
        } else {
            filterClause = {
                terms: {[fieldKey]: terms.include}
            }
        }
    }

    let filterExclude = null
    if (terms?.exclude?.length) {
        filterExclude = {
            terms: { [fieldKey]: terms.exclude }
        }
    }

    let filterMissing = null
    if (terms?.missing === 'true') {
        filterMissing = false
    } else if (terms?.missing === 'false') {
        filterMissing = true
    }

    return {
        field,
        originalField: field,
        aggregation,
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
                        [fieldKey]: intervalFormat(interval, selected)
                    }
                }))
            }
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
        originalField: field,
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

const rangeFormat = (fieldKey, range, isFilter = false) => {
    if (!range.includes('-')) {
        throw new Error('Invalid range format. Missing "-" sign.')
    }

    let rangeQuery
    const rangeEdges = range.split('-')

    if (!rangeEdges[0].length || !rangeEdges[1].length) {
        throw new Error('Invalid range format. Missing range edge.')
    }

    if (rangeEdges[0] === '*') {
        return {
            [isFilter ? 'lte' : 'to']: rangeEdges[1],
        }
    } else if (rangeEdges[1] === '*') {
        return {
            [isFilter ? 'gte' : 'from']: rangeEdges[0],
        }
    }

    return {
        [isFilter ? 'gte' : 'from']: rangeEdges[0],
        [isFilter ? 'lt' : 'to']: rangeEdges[1],
    }
}

const buildRangeField = (field, uuid, ranges) => {
    const fieldKey = expandPrivate(field, uuid)

    let filterClause = null
    if (ranges?.include?.length) {
        filterClause = {
            bool: {
                should: ranges.include.map(selected => ({
                    range: {
                        [fieldKey]: rangeFormat(fieldKey, selected, true)
                    }
                }))
            }
        }
    }

    let filterExclude = null
    if (ranges?.exclude?.length) {
        filterExclude = {
            bool: {
                should: ranges.exclude.map(selected => ({
                    range: {
                        [fieldKey]: rangeFormat(fieldKey, selected, true)
                    }
                }))
            }
        }
    }

    let filterMissing = null
    if (ranges?.missing === 'true') {
        filterMissing = false
    } else if (ranges?.missing === 'false') {
        filterMissing = true
    }

    return {
        field,
        originalField: field,
        aggregation: {
            range: {
                field: fieldKey,
                ranges: aggregationFields[field].buckets.map(({ key }) => ({
                    key,
                    ...rangeFormat(fieldKey, key)
                }))
            }
        },
        filterClause,
        filterExclude,
        filterMissing,
    }
}

const buildMissingField = (field, uuid) => ({
    field: `${field}-missing`,
    originalField: field,
    aggregation: {
        missing: { field: expandPrivate(field, uuid) },
    }
})

const prepareFilter = field => {
    const filter = []

    if (field.filterClause) {
        filter.push(field.filterClause)
    }

    if (field.filterExclude) {
        filter.push({ bool: { must_not: field.filterExclude } })
    }

    if (typeof field.filterMissing === 'boolean') {
        const exists = { exists: { field: field.field } }
        if (field.filterMissing) {
            filter.push(exists)
        } else {
            filter.push({ bool: { must_not: exists } })
        }
    }

    if (filter.length) {
        return filter
    }
}

const buildFilter = fields => {
    const filter = []

    fields.forEach(field => {
        const fieldFilter = prepareFilter(field)

        if (fieldFilter) {
            if (aggregationFields[field.originalField].type === 'term-and') {
                filter.push(...fieldFilter)
            } else {
                filter.push({ bool: { should: fieldFilter } })
            }
        }
    })

    if (filter.length) {
        return { bool: { filter } }
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
        filter: buildFilter(fields.filter(other => other.originalField !== field.originalField)),
    },
}), {})

const getAggregationFields = (type, fieldList) => Object.entries(aggregationFields)
    .filter(([,field]) => field.type.startsWith(type))
    .map(([key]) => key)
    .filter(field => fieldList === '*' || (Array.isArray(fieldList) && fieldList.includes(field)))

const buildSearchQuery = (
    {
        q = '*',
        page = 1,
        size = 0,
        order,
        collections = [],
        facets = {},
        filters = {},
        allBuckets = {},
    } = {},
    type = 'results',
    fieldList = '*',
    missing = false,
    searchFields,
    uuid
) => {

    const query = buildQuery(q, filters, searchFields)
    const sort = buildSortQuery(order)

    const dateFields = getAggregationFields('date', fieldList)
    const termFields = getAggregationFields('term', fieldList)
    const rangeFields = getAggregationFields('range', fieldList)

    const fields = missing ? [
        ...dateFields.map(field => buildMissingField(field, uuid)),
        ...termFields.map(field => buildMissingField(field, uuid)),
        ...rangeFields.map(field => buildMissingField(field, uuid)),
    ] : [
        ...dateFields.map(field => buildHistogramField(field, uuid, filters[field], facets[field])),
        ...termFields.map(field => buildTermsField(field, uuid, filters[field], facets[field], allBuckets[field])),
        ...rangeFields.map(field => buildRangeField(field, uuid, filters[field], facets[field])),
    ]

    const postFilter = buildFilter(fields)
    const aggs = buildAggs(fields)

    const highlightFields = {}
    searchFields.highlight.forEach(field => {
        highlightFields[field] = HIGHLIGHT_SETTINGS
    })

    return {
        from: (page - 1) * size,
        size: type === 'results' ? size : 0,
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
