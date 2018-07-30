import { Component } from 'react';
import qs from 'qs';
import cn from 'classnames';
import equal from 'fast-deep-equal';

import Link from 'next/link';
import Router from 'next/router';

import api from '../utils/api';
import routerEvents from '../utils/router-events';

import Dropdown from './Dropdown';
import CollectionsBox from './CollectionsBox';
import SearchResults from './SearchResults';

import { pickBy, identity, castArray } from 'lodash';

import {
    SORT_RELEVANCE,
    SORT_NEWEST,
    SORT_OLDEST,
    SORT_OPTIONS,
    SEARCH_GUIDE,
    SIZE_OPTIONS,
} from '../utils/constants';

export default class SearchPage extends Component {
    state = {
        allCollections: null,
        results: null,
        isFetching: false,
        query: {},
        searchAfterByPage: {},
        error: null,
    };

    componentDidMount() {
        this.setState({ query: this.parseQueryFromUrl() }, async () => {
            await this.getCollections();

            if (this.state.query.q) {
                this.search();
            }
        });

        routerEvents.on('changeComplete', this.searchIfNecessary);
    }

    componentWillUnmount() {
        routerEvents.removeListener('changeComplete', this.searchIfNecessary);
    }

    searchIfNecessary = url => {
        const parsedQuery = this.parseQueryFromUrl();

        if (!equal(parsedQuery, this.state.query) && this.state.query.q) {
            this.setState({ query: parsedQuery }, this.search);
        }
    };

    parseQueryFromUrl() {
        const params = qs.parse(window.location.search.slice(1));

        return {
            q: params.q ? String(params.q).replace(/\+/g, ' ') : '',
            size: params.size ? +params.size : 10,
            order: params.order ? params.order : SORT_OPTIONS[0],
            collections: params.collections ? params.collections.split('+') : [],
            dateFrom: params.dateFrom,
            dateTo: params.dateTo,
            dateYears: params.dateYears ? castArray(params.dateYears) : [],
            dateCreatedYears: params.dateCreatedYears
                ? castArray(params.dateCreatedYears)
                : [],
            page: params.page ? +params.page : 1,
            searchAfter: params.searchAfter || '',
            fileType: params.fileType ? castArray(params.fileType) : [],
        };
    }

    writeQueryToUrl() {
        let query = {
            ...this.state.query,
            collections: this.state.query.collections.join('+'),
        };

        query = pickBy(query, d => (Array.isArray(d) ? d.length : Boolean(d)));

        Router.push({
            pathname: '/',
            query,
        });
    }

    componentDidCatch(error, info) {
        this.setState({ error });
    }

    async getCollections() {
        const allCollections = await api.collections();

        const { collections } = this.state.query;

        this.setState({
            allCollections,
            query: {
                ...this.state.query,
                collections:
                    collections && collections.length
                        ? collections
                        : allCollections.map(e => e.name),
            },
        });
    }

    setSize = event => {
        const { query } = this.state;

        this.setState(
            {
                query: {
                    ...query,
                    size: event.target.name,
                    page: 1,
                    searchAfter: '',
                },
                searchAfterByPage: {},
            },
            this.search
        );
    };

    setSort = event => {
        const { query } = this.state;

        this.setState(
            {
                query: {
                    ...query,
                    order: event.target.name,
                    page: 1,
                    searchAfter: '',
                },
                searchAfterByPage: {},
            },
            this.search
        );
    };

    onChangeCollections = selected => {
        this.setState(
            {
                query: {
                    ...this.state.query,
                    collections: selected,
                    page: 1,
                    searchAfter: '',
                },
                searchAfterByPage: {},
            },
            this.search
        );
    };

    handleInputChange = event =>
        this.setState({
            query: {
                ...this.state.query,
                q: event.target.value,
            },
        });

    handleSubmit = event => {
        event.preventDefault();

        this.setState(
            {
                query: {
                    ...this.state.query,
                    page: 1,
                    searchAfter: '',
                },
                searchAfterByPage: {},
            },
            this.search
        );
    };

    loadNextPage = () => {
        const { query, searchAfterByPage } = this.state;
        const { page } = query;

        this.setState(
            {
                query: {
                    ...query,
                    page: page + 1,
                    searchAfter: searchAfterByPage[page + 1],
                },
            },
            this.search
        );
    };

    loadPrevPage = () => {
        const { query, searchAfterByPage } = this.state;
        const { page } = query;

        this.setState(
            {
                query: {
                    ...query,
                    page: page - 1,
                    searchAfter: searchAfterByPage[page - 1],
                },
            },
            this.search
        );
    };

    handleFilter = filter => {
        const { query } = this.state;

        const urlQuery = {};

        if (
            filter.date &&
            filter.date.length &&
            filter.date.every(e => e && e.length === 4) // is year
        ) {
            urlQuery.dateYears = filter.date;
        } else {
            urlQuery.dateYears = [];
        }

        if (
            filter.date &&
            filter.date.length === 2 &&
            filter.date.every(d => d && d.length === 10) // is full date
        ) {
            urlQuery.dateFrom = filter.date[0];
            urlQuery.dateTo = filter.date[1];
        } else {
            urlQuery.dateFrom = null;
            urlQuery.dateTo = null;
        }

        if (filter['date-created']) {
            urlQuery.dateCreatedYears = filter['date-created'];
        }

        if (filter.filetype) {
            urlQuery.fileType = filter.filetype;
        }

        this.setState(
            {
                query: {
                    ...query,
                    ...urlQuery,
                    searchAfter: '',
                    page: 1,
                },
                searchAfterByPage: {},
            },
            this.search
        );
    };

    search() {
        this.setState({ isFetching: true }, async () => {
            this.writeQueryToUrl();

            let results, error;

            try {
                results = await api.search(this.state.query);
            } catch (err) {
                error = err;
            }

            const { query, searchAfterByPage } = this.state;
            const { page, order } = query;

            if (results.hits.total > 0) {
                const lastHit = results.hits.hits.slice(-1)[0];

                searchAfterByPage[page + 1] = ['' + lastHit._score, lastHit._id];
                if (order !== 'Relevance') {
                    const date = new Date(lastHit._source.date);

                    searchAfterByPage[page + 1] = [
                        '' + date.getTime(),
                        ...searchAfterByPage[page + 1],
                    ];
                }
            }

            this.setState({
                searchAfterByPage,
                isFetching: false,
                results,
                error,
            });
        });
    }

    render() {
        const {
            allCollections,
            query: { collections, q, size, order },
            error,
        } = this.state;

        if (error) {
            return <p className="alert alert-warning">{error.toString()}</p>;
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <div className="row">
                    <div className="col-sm-2">
                        <CollectionsBox
                            collections={allCollections}
                            selected={collections || []}
                            onChange={this.onChangeCollections}
                            counts={
                                this.state.results
                                    ? this.state.results.count_by_index
                                    : null
                            }
                        />
                    </div>

                    <div className="col-sm-10">
                        <div id="search-input-box" className="form-group">
                            <input
                                name="q"
                                value={q || ''}
                                onChange={this.handleInputChange}
                                type="search"
                                autoFocus
                                className="form-control p-3"
                                placeholder="Search..."
                            />

                            <div className="d-flex justify-content-between">
                                <div>
                                    <small>
                                        Refine your search using{' '}
                                        <a href={SEARCH_GUIDE}>this handy guide</a>.
                                    </small>
                                </div>

                                <div>
                                    <small>
                                        <Link href="/batch-search">
                                            <a>Batch search</a>
                                        </Link>
                                    </small>
                                </div>
                            </div>

                            <div className="d-flex align-items-center  justify-content-between mt-2">
                                <div>
                                    <div>
                                        <small className="text-muted pr-2">
                                            Results per page
                                        </small>
                                    </div>

                                    <div
                                        className="btn-group btn-group-toggle"
                                        data-toggle="buttons">
                                        {SIZE_OPTIONS.map(sizeOption => (
                                            <label
                                                key={sizeOption}
                                                className={cn(
                                                    'btn btn-sm btn-secondary',
                                                    {
                                                        active: sizeOption === size,
                                                    }
                                                )}>
                                                <input
                                                    type="radio"
                                                    name={sizeOption}
                                                    autoComplete="off"
                                                    onChange={this.setSize}
                                                    checked={sizeOption == size}
                                                />{' '}
                                                {sizeOption}
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <div>
                                        <small className="text-muted pr-2">
                                            Sort by
                                        </small>
                                    </div>
                                    <div
                                        className="btn-group btn-group-toggle"
                                        data-toggle="buttons">
                                        {SORT_OPTIONS.map(sortOption => (
                                            <label
                                                key={sortOption}
                                                className={cn(
                                                    'btn btn-sm btn-secondary',
                                                    {
                                                        active: sortOption === order,
                                                    }
                                                )}>
                                                <input
                                                    type="radio"
                                                    name={sortOption}
                                                    autoComplete="off"
                                                    onChange={this.setSort}
                                                    checked={sortOption === order}
                                                />{' '}
                                                {sortOption}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SearchResults
                    isFetching={this.state.isFetching}
                    results={this.state.results}
                    query={this.state.query}
                    onNextPage={this.loadNextPage}
                    onPrevPage={this.loadPrevPage}
                    onFilter={this.handleFilter}
                />

                {this.state.error && (
                    <p className="alert alert-danger">
                        {this.state.error.toString()}
                    </p>
                )}
            </form>
        );
    }
}
