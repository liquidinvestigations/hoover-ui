import { DEFAULT_FACET_SIZE, SORTABLE_FIELDS } from './constants'

function buildQuery(q, { dateCreatedRange, dateModifiedRange }) {
    const qs = {
        query_string: {
            query: q,
            default_operator: 'AND',
        },
    }

    const queryRanges = []
    if (dateCreatedRange) {
        queryRanges.push(['date-created', dateCreatedRange])
    }
    if (dateModifiedRange) {
        queryRanges.push(['date', dateModifiedRange])
    }

    const ranges = []
    queryRanges.forEach(([field, dateRange]) => {
        if (dateRange && dateRange.from && dateRange.to) {
            ranges.push({
                range: {
                    [field]: {
                        gte: dateRange.from,
                        lte: dateRange.to,
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

function buildSortQuery(order) {
    let sort = [];

    Array.isArray(order) && order.filter(([field, direction = 'asc']) =>
        Object.keys(SORTABLE_FIELDS).includes(field) && ['asc', 'desc'].includes(direction)
    ).reverse().forEach(([field, direction = 'asc']) => {
        if (field.startsWith('_')) {
            sort = [field, ...sort]
        } else {
            sort = [{[field]: {order: direction, missing: '_last'}}, ...sort]
        }
    })

    return sort;
}

function buildTermsField(
    name,
    terms,
    { field = name, size = DEFAULT_FACET_SIZE } = {}
) {
    return {
        name,
        field,
        aggregation: {
            terms: { field, size },
        },
        filterClause:
            terms && terms.length
                ? {
                      terms: { [field]: terms },
                  }
                : null,
    };
}

function buildYearField(name, value, { field = name } = {}) {
    return {
        name,
        field,
        aggregation: {
            date_histogram: {
                field,
                interval: 'year',
            },
        },
        filterClause:
            value && value.length
                ? {
                      bool: {
                          should: value.map(year => ({
                              range: {
                                  date: {
                                      gte: `${year}-01-01`,
                                      lte: `${year}-12-31`,
                                  },
                              },
                          })),
                      },
                  }
                : null,
    };
}

function buildFilter(fields) {
    const must = fields.map(f => f.filterClause).filter(Boolean);

    if (must.length) {
        return {
            bool: {
                must,
            },
        };
    } else {
        return { bool: {} };
    }
}

function buildAggs(fields) {
    return fields.reduce(
        (result, field) => ({
            ...result,
            [`count_by_${field.name}`]: {
                aggs: {
                    [field.name]: field.aggregation,
                    [`${field.name}_count`]: { cardinality: { field: field.field } },
                },
                filter: buildFilter(
                    fields.filter(other => other.name !== field.name)
                ),
            },
        }),
        {}
    );
}

export default function buildSearchQuery({
    page = 1,
    size = 0,
    q = '*',
    order = null,
    collections = [],
    dateYears = null,
    dateCreatedYears = null,
    dateCreatedRange,
    dateModifiedRange,
    searchAfter = '',
    fileType = null,
    language = null,
    emailDomains = null,
    facets = {},
} = {}) {
    const query = buildQuery(q, { dateCreatedRange, dateModifiedRange });
    const sort = buildSortQuery(order);

    const fields = [
        buildTermsField('filetype', fileType, { size: facets.fileType }),
        buildTermsField('email_domains', emailDomains, {
            field: 'email-domains',
            size: facets.emailDomains,
        }),
        buildTermsField('lang', language, { size: facets.language }),
        buildYearField('date_years', dateYears, {
            field: 'date',
            size: facets.dateYears,
        }),
        buildYearField('date_created_years', dateCreatedYears, {
            field: 'date-created',
            size: facets.dateCreatedYears,
        }),
    ];

    const postFilter = buildFilter(fields);
    const aggs = buildAggs(fields);

    return {
        from: (page - 1) * size,
        size: size,
        query,
        search_after: searchAfter,
        sort,
        post_filter: postFilter,
        aggs,
        collections: collections,
        _source: [
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
    };
}
