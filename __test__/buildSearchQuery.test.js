import buildSearchQuery from '../src/backend/buildSearchQuery'

const searchFields = {
    all: [],
    _source: [],
    highlight: []
}

it('builds a default query', () => {
    const query = buildSearchQuery({}, null, searchFields)
    expect(query).toMatchSnapshot()
})

it('builds a query with a filetype filter', () => {
    const query = buildSearchQuery({ filetype: ['email', 'pdf'] }, null, searchFields)

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
    const query = buildSearchQuery({ date: { intervals: ['2009'] } }, null, searchFields)

    const yearFilter = {
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
    }, null, searchFields)

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
