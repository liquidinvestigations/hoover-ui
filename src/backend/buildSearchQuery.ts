import { DateTime } from 'luxon'
import { DEFAULT_FACET_SIZE, DEFAULT_INTERVAL, DEFAULT_OPERATOR, HIGHLIGHT_SETTINGS, PRIVATE_FIELDS } from '../constants/general'
import { daysInMonth } from '../utils/utils'
import { aggregationFields } from '../constants/aggregationFields'
import { SearchQueryParams, SearchQueryType } from '../Types'

export interface SearchFields {
    all: string[]
    highlight: string[]
    _source: string[]
}

export interface Terms {
    include?: string[]
    exclude?: string[]
    missing?: 'false' | 'true'
}

export interface Field {
    field: string
    originalField: string
    aggregation: {
        terms?: {
            field: string
            size: number
        }
        range?: {}
        missing?: {}
        date_histogram?: {}
    }
    filterClause?: any
    filterExclude?: any
    filterMissing?: boolean | null
}

const expandPrivate = (field: string, uuid: string) => {
    if (PRIVATE_FIELDS.includes(field)) {
        return `${field}.${uuid}`
    }
    return field
}

const buildQuery = (q: string, filters: Record<string, any>, searchFields: SearchFields) => {
    const qs = {
        query_string: {
            query: q,
            default_operator: DEFAULT_OPERATOR,
            fields: searchFields.all,
            lenient: true,
        },
    }

    const ranges: { range: { [x: string]: { gte: string; lte: string } } }[] = []
    ;['date', 'date-created'].forEach((field) => {
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

const buildSortQuery = (order: string[][] | undefined) =>
    order
        ?.reverse()
        .map(([field, direction = 'asc']) =>
            field.startsWith('_') ? { [field]: { order: direction } } : { [field]: { order: direction, missing: '_last' } }
        ) || []

const buildTermsField = (field: string, uuid: string, terms: Terms, page = 1, size = DEFAULT_FACET_SIZE): Field => {
    const fieldKey = expandPrivate(field, uuid)

    let filterClause = null
    if (terms?.include?.length) {
        if (aggregationFields[field].type === 'term-and') {
            filterClause = terms.include.map((term) => ({
                term: { [fieldKey]: term },
            }))
        } else {
            filterClause = {
                terms: { [fieldKey]: terms.include },
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

    return {
        field,
        originalField: field,
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

export type Interval = 'day' | 'hour' | 'month' | 'week' | 'year'

const intervalFormat = (interval: Interval, param: string) => {
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
                lt: `${DateTime.fromISO(param).plus({ days: 7 }).toISODate()}T23:59:59.999Z`,
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

interface HistogramParams {
    interval?: Interval
    intervals?: Terms
}

const buildHistogramField = (
    field: string,
    uuid: string,
    { interval = DEFAULT_INTERVAL, intervals }: HistogramParams = {},
    page = 1,
    size = DEFAULT_FACET_SIZE
) => {
    const fieldKey = expandPrivate(field, uuid)

    let filterClause = null
    if (intervals?.include?.length) {
        filterClause = {
            bool: {
                should: intervals.include.map((selected) => ({
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
        originalField: field,
        aggregation: {
            date_histogram: {
                field: fieldKey,
                interval,
                min_doc_count: 1,
                order: { _key: 'desc' },
            },
            aggs: {
                bucket_truncate: {
                    bucket_sort: {
                        from: (page - 1) * size,
                        size,
                    },
                },
            },
        },
        filterClause,
        filterMissing,
    }
}

const rangeFormat = (range: string, isFilter = false) => {
    if (!range.includes('-')) {
        throw new Error('Invalid range format. Missing "-" sign.')
    }

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

const buildRangeField = (field: string, uuid: string, ranges: Terms | undefined): Field => {
    const fieldKey = expandPrivate(field, uuid)

    const rangeFields = (selected: string) => ({
        range: {
            [fieldKey]: rangeFormat(selected, true),
        },
    })

    let filterClause = null
    if (ranges?.include?.length) {
        filterClause = {
            bool: {
                should: ranges.include.map(rangeFields),
            },
        }
    }

    let filterExclude = null
    if (ranges?.exclude?.length) {
        filterExclude = {
            bool: {
                should: ranges.exclude.map(rangeFields),
            },
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
                ranges: aggregationFields[field].buckets?.map(({ key }) => ({
                    key,
                    ...rangeFormat(key),
                })),
            },
        },
        filterClause,
        filterExclude,
        filterMissing,
    }
}

const buildMissingField = (field: string, uuid: string) => ({
    field: `${field}-missing`,
    originalField: field,
    aggregation: {
        missing: { field: expandPrivate(field, uuid) },
    },
})

const prepareFilter = (field: Field) => {
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

const buildFilter = (fields: Field[]) => {
    const filter: any = []

    fields.forEach((field) => {
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

const buildAggs = (fields: Field[]) =>
    fields.reduce(
        (result, field) => ({
            ...result,
            [field.field]: {
                aggs: {
                    values: field.aggregation,
                    count: { cardinality: { field: field.field } },
                },
                filter: buildFilter(fields.filter((other) => other.originalField !== field.originalField)),
            },
        }),
        {}
    )

export type FieldList = '*' | string[]
export type FieldType = 'date' | 'range' | 'term'

const getAggregationFields = (type: FieldType, fieldList: FieldList) =>
    Object.entries(aggregationFields)
        .filter(([, field]) => field.type.startsWith(type))
        .map(([key]) => key)
        .filter((field) => fieldList === '*' || (Array.isArray(fieldList) && fieldList.includes(field)))

const buildSearchQuery = (
    { q = '*', page = 1, size = 0, order, collections = [], facets = {}, filters = {} }: Partial<SearchQueryParams> = {},
    type: SearchQueryType,
    fieldList: FieldList,
    missing: boolean,
    searchFields: SearchFields,
    uuid: string
) => {
    const query = buildQuery(q, filters, searchFields)
    const sort = buildSortQuery(order)
    const significantFields = fieldList === '*' ? '*' : [...fieldList, ...Object.keys(filters)]

    const dateFields = getAggregationFields('date', significantFields)
    const termFields = getAggregationFields('term', significantFields)
    const rangeFields = getAggregationFields('range', significantFields)

    const fields = missing
        ? [
              ...dateFields.map((field) => buildMissingField(field, uuid)),
              ...termFields.map((field) => buildMissingField(field, uuid)),
              ...rangeFields.map((field) => buildMissingField(field, uuid)),
          ]
        : [
              ...dateFields.map((field) => buildHistogramField(field, uuid, filters[field], facets[field])),
              ...termFields.map((field) => buildTermsField(field, uuid, filters[field], facets[field])),
              ...rangeFields.map((field) => buildRangeField(field, uuid, filters[field])),
          ]

    const postFilter = buildFilter(fields)
    const aggs = buildAggs(fields)

    const highlightFields: Record<string, any> = {}
    searchFields.highlight.forEach((field) => {
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
