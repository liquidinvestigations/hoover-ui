import buildSearchQuery from '../src/build-search-query';

it('builds a default query', () => {
    const query = buildSearchQuery();
    expect(query).toMatchSnapshot();
});

it('builds a query with a filetype filter', () => {
    const query = buildSearchQuery({ fileType: ['email', 'pdf'] });

    expect(query.post_filter).toMatchObject({
        bool: {
            must: [{ terms: { filetype: ['email', 'pdf'] } }],
        },
    });

    expect(query.aggs.count_by_email_domains).toMatchObject({
        aggs: {
            email_domains: {
                terms: { field: 'email-domains' },
            },
        },
        filter: {
            bool: {
                must: [{ terms: { filetype: ['email', 'pdf'] } }],
            },
        },
    });

    expect(query.aggs.count_by_filetype).toMatchObject({
        aggs: {
            filetype: {
                terms: { field: 'filetype' },
            },
        },
    });
});

it('builds a query with a date year filter', () => {
    const query = buildSearchQuery({ dateYears: ['2009'] });

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
    };

    expect(query.post_filter).toMatchObject({
        bool: {
            must: [yearFilter],
        },
    });

    expect(query.aggs.count_by_filetype).toMatchObject({
        aggs: {
            filetype: {
                terms: { field: 'filetype' },
            },
        },
        filter: {
            bool: {
                must: [yearFilter],
            },
        },
    });

    expect(query.aggs.count_by_date_years).toMatchObject({
        aggs: {
            date_years: {
                date_histogram: { field: 'date', interval: 'year' },
            },
        },
        filter: {
            bool: {},
        },
    });
});

it('builds a query with multiple fields filtered', () => {
    const query = buildSearchQuery({
        fileType: ['doc', 'email'],
        emailDomains: ['gmail.com'],
    });

    expect(query.post_filter).toMatchObject({
        bool: {
            must: [
                { terms: { filetype: ['doc', 'email'] } },
                { terms: { 'email-domains': ['gmail.com'] } },
            ],
        },
    });

    expect(query.aggs.count_by_filetype).toMatchObject({
        aggs: {
            filetype: {
                terms: { field: 'filetype' },
            },
        },
        filter: {
            bool: {
                must: [{ terms: { 'email-domains': ['gmail.com'] } }],
            },
        },
    });

    expect(query.aggs.count_by_email_domains).toMatchObject({
        aggs: {
            email_domains: {
                terms: { field: 'email-domains' },
            },
        },
        filter: {
            bool: {
                must: [{ terms: { filetype: ['doc', 'email'] } }],
            },
        },
    });
});
