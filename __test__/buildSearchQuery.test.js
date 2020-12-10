import buildSearchQuery from '../src/buildSearchQuery'

it('builds a default query', () => {
    const query = buildSearchQuery()
    expect(query).toMatchSnapshot()
})

it('builds a query with a filetype filter', () => {
    const query = buildSearchQuery({ filetype: ['email', 'pdf'] })

    expect(query.post_filter).toMatchObject({
        bool: {
            must: [{ terms: { filetype: ['email', 'pdf'] } }],
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
                must: [{ terms: { filetype: ['email', 'pdf'] } }],
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
    const query = buildSearchQuery({ date: { intervals: ['2009'] } })

    const yearFilter = {
        bool: {
            should: [
                {
                    range: {
                        date: {
                            gte: '2009-01-01',
                            lte: '2009-12-31',
                        },
                    },
                },
            ],
        },
    }

    expect(query.post_filter).toMatchObject({
        bool: {
            must: [yearFilter],
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
                must: [yearFilter],
            },
        },
    })

    expect(query.aggs.date).toMatchObject({
        aggs: {
            values: {
                date_histogram: { field: 'date', interval: 'year' },
            },
        },
        filter: {
            bool: {},
        },
    })
})

it('builds a query with multiple fields filtered', () => {
    const query = buildSearchQuery({
        filetype: ['doc', 'email'],
        'email-domains': ['gmail.com'],
    })

    expect(query.post_filter).toMatchObject({
        bool: {
            must: [
                { terms: { filetype: ['doc', 'email'] } },
                { terms: { 'email-domains': ['gmail.com'] } },
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
                must: [{ terms: { 'email-domains': ['gmail.com'] } }],
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
                must: [{ terms: { filetype: ['doc', 'email'] } }],
            },
        },
    })
})
