import buildSearchQuery from '../src/backend/buildSearchQuery'

const searchFields = {
    all: [],
    _source: [],
    highlight: [],
}

it('builds a default query', () => {
    const query = buildSearchQuery({}, 'aggregations', '*', false, searchFields, [], 'testuser')
    expect(query).toMatchSnapshot()
})

it('builds a query with a filetype filter', () => {
    const query = buildSearchQuery(
        {
            filters: {
                filetype: {
                    include: ['email', 'pdf'],
                },
            },
        },
        'aggregations',
        '*',
        false,
        searchFields,
        [],
        'testuser',
    )

    expect(query.post_filter).toMatchObject({
        bool: {
            filter: [{ bool: { should: [{ terms: { filetype: ['email', 'pdf'] } }] } }],
        },
    })

    expect(query.aggs['email-domains']).toMatchObject({
        aggs: {
            values: {
                terms: { field: 'email-domains' },
            },
        },
        filter: {
            bool: {
                filter: [{ bool: { should: [{ terms: { filetype: ['email', 'pdf'] } }] } }],
            },
        },
    })

    expect(query.aggs.filetype).toMatchObject({
        aggs: {
            values: {
                terms: { field: 'filetype' },
            },
        },
    })
})

it('builds a query with a date histogram by years filter', () => {
    const query = buildSearchQuery(
        {
            filters: {
                date: {
                    intervals: {
                        include: ['2009'],
                    },
                },
            },
        },
        'aggregations',
        '*',
        false,
        searchFields,
        [],
        'testuser',
    )

    const yearFilter = {
        bool: {
            should: [
                {
                    bool: {
                        should: [
                            {
                                range: {
                                    date: {
                                        gte: '2009-01-01T00:00:00.000Z',
                                        lte: '2009-12-31T23:59:59.999Z',
                                    },
                                },
                            },
                        ],
                    },
                },
            ],
        },
    }

    expect(query.post_filter).toMatchObject({
        bool: {
            filter: [yearFilter],
        },
    })

    expect(query.aggs.filetype).toMatchObject({
        aggs: {
            values: {
                terms: { field: 'filetype' },
            },
        },
        filter: {
            bool: {
                filter: [yearFilter],
            },
        },
    })

    expect(query.aggs.date).toMatchObject({
        aggs: {
            values: {
                date_histogram: { field: 'date', interval: 'year' },
            },
        },
        filter: {},
    })
})

it('builds a query with multiple fields filtered', () => {
    const query = buildSearchQuery(
        {
            filters: {
                filetype: {
                    include: ['doc', 'email'],
                },
                'email-domains': {
                    include: ['gmail.com'],
                },
            },
        },
        'aggregations',
        '*',
        false,
        searchFields,
        [],
        'testuser',
    )

    expect(query.post_filter).toMatchObject({
        bool: {
            filter: [
                { bool: { should: [{ terms: { filetype: ['doc', 'email'] } }] } },
                { bool: { should: [{ terms: { 'email-domains': ['gmail.com'] } }] } },
            ],
        },
    })

    expect(query.aggs.filetype).toMatchObject({
        aggs: {
            values: {
                terms: { field: 'filetype' },
            },
        },
        filter: {
            bool: {
                filter: [{ bool: { should: [{ terms: { 'email-domains': ['gmail.com'] } }] } }],
            },
        },
    })

    expect(query.aggs['email-domains']).toMatchObject({
        aggs: {
            values: {
                terms: { field: 'email-domains' },
            },
        },
        filter: {
            bool: {
                filter: [{ bool: { should: [{ terms: { filetype: ['doc', 'email'] } }] } }],
            },
        },
    })
})
