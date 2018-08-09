import { SORT_RELEVANCE, SORT_NEWEST, SORT_OLDEST, DATE_FORMAT } from './constants';

function buildQuery(q, { dateRange }) {
    const qs = {
        query_string: {
            query: q,
            default_operator: 'AND',
        },
    };

    if (dateRange && dateRange.from && dateRange.to) {
        return {
            bool: {
                must: qs,
                filter: {
                    range: {
                        date: {
                            gte: dateRange.from.toFormat(DATE_FORMAT),
                            lte: dateRange.to.toFormat(DATE_FORMAT),
                        },
                    },
                },
            },
        };
    }

    return qs;
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

// function buildPostFilter(filters) {
//     const clauses = Object.entries(filters)
//         .filter(([key, value]) => value && value.length)
//         .map(([key, value]) => {
//             if (key === 'dateYears') {
//                 return {
//                     bool: {
//                         should: value.map(year => ({
//                             range: {
//                                 date: { gte: `${year}-01-01`, lte: `${year}-12-31` },
//                             },
//                         })),
//                     },
//                 };
//             } else if (key === 'dateCreatedYears') {
//                 return {
//                     bool: {
//                         should: value.map(year => ({
//                             range: {
//                                 'date-created': {
//                                     gte: `${year}-01-01`,
//                                     lte: `${year}-12-31`,
//                                 },
//                             },
//                         })),
//                     },
//                 };
//             } else if (key === 'fileType') {
//                 return {
//                     terms: {
//                         filetype: value,
//                     },
//                 };
//             } else if (key === 'language') {
//                 return {
//                     terms: {
//                         lang: value,
//                     },
//                 };
//             } else if (key === 'emailDomains') {
//                 return {
//                     terms: {
//                         'email-domains': value,
//                     },
//                 };
//             } else {
//                 throw new Error(`unknown filter: ${JSON.stringify({ key, value })}`);
//             }
//         });

//     if (clauses.length) {
//         return { bool: { must: clauses } };
//     } else {
//         return {};
//     }
// }

// function buildAggregations() {
//     return {
//         count_by_filetype: {
//             terms: { field: 'filetype' },
//         },
//         count_by_date_year: {
//             date_histogram: {
//                 field: 'date',
//                 interval: 'year',
//             },
//         },
//         count_by_date_created_year: {
//             date_histogram: {
//                 field: 'date-created',
//                 interval: 'year',
//             },
//         },
//         count_by_lang: {
//             terms: {
//                 field: 'lang',
//             },
//         },
//         count_by_email_domain: {
//             terms: {
//                 field: 'email-domains',
//             },
//         },
//     };
// }

function buildTermsField(name, terms, field) {
    field = field || name;

    return {
        name,
        aggregation: {
            terms: { field },
        },
        filterClause:
            terms && terms.length
                ? {
                      terms: { [field]: terms },
                  }
                : null,
    };
}

function buildYearField(name, value, field) {
    return {
        name,
        aggregation: {
            date_histogram: {
                field: field || name,
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
    order = SORT_RELEVANCE,
    collections = [],
    dateYears = null,
    dateCreatedYears = null,
    dateRange,
    searchAfter = '',
    fileType = null,
    language = null,
    emailDomains = null,
} = {}) {
    const query = buildQuery(q, { dateRange });
    const sort = buildSortQuery(order);

    const fields = [
        buildTermsField('filetype', fileType),
        buildTermsField('email_domains', emailDomains),
        buildTermsField('lang', language),
        buildYearField('date_years', dateYears, 'date'),
        buildYearField('date_created_years', dateCreatedYears, 'date-created'),
    ];

    const postFilter = buildFilter(fields);
    const aggs = buildAggs(fields);

    const postFilterLength = Object.keys(postFilter).length;

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
