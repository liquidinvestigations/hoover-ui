import { Component } from 'react';
import qs from 'qs';
import cn from 'classnames';
import equal from 'fast-deep-equal';

import Link from 'next/link';
import Router from 'next/router';

import ReactPlaceholder from 'react-placeholder';
import api from '../utils/api';
import routerEvents from '../utils/router-events';

import Dropdown from './Dropdown';
import CollectionsBox from './CollectionsBox';
import SearchResults from './SearchResults';

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
            page: params.page ? +params.page : 1,
        };
    }

    writeQueryToUrl() {
        Router.push({
            pathname: '/',
            query: {
                ...this.state.query,
                collections: this.state.query.collections.join('+'),
            },
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
        this.setState(
            { query: { ...this.state.query, size: +event.target.name } },
            this.search
        );
    };

    setSort = event =>
        this.setState(
            { query: { ...this.state.query, order: event.target.name } },
            this.search
        );

    onChangeCollections = selected => {
        this.setState(
            { query: { ...this.state.query, collections: selected } },
            this.search
        );
    };

    handleInputChange = event =>
        this.setState({ query: { ...this.state.query, q: event.target.value } });

    handleSubmit = event => {
        event.preventDefault();
        this.setState({ query: { ...this.state.query, page: 1 } }, this.search);
    };

    loadNextPage = () => {
        const { query } = this.state;
        this.setState({ query: { ...query, page: query.page + 1 } }, this.search);
    };

    loadPrevPage = () => {
        const { query } = this.state;
        this.setState({ query: { ...query, page: query.page - 1 } }, this.search);
    };

    handleFilter = filter => {
        const { query } = this.state;
        const filterQueries = Object.entries(filter).map(f => f.join(':'));

        const q =
            query.q.indexOf(filterQueries) !== -1
                ? query.q
                : [query.q, ...filterQueries].join(' ');

        this.setState({ query: { ...query, q, page: 1 } }, this.search);
    };

    search() {
        this.setState({ isFetching: true, results: null }, async () => {
            this.writeQueryToUrl();

            let results, error;

            try {
                results = await api.search(this.state.query);
            } catch (err) {
                error = err;
            }

            this.setState({
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
                            <i className="fa fa-search" />

                            <input
                                name="q"
                                value={q || ''}
                                onChange={this.handleInputChange}
                                type="search"
                                autoFocus
                                className="form-control"
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

                        <hr />
                    </div>
                </div>

                <ReactPlaceholder
                    showLoadingAnimation
                    ready={!this.state.isFetching}
                    type="text"
                    rows={10}>
                    <SearchResults
                        results={this.state.results}
                        query={this.state.query}
                        onNextPage={this.loadNextPage}
                        onPrevPage={this.loadPrevPage}
                        onFilter={this.handleFilter}
                    />
                </ReactPlaceholder>

                {this.state.error && (
                    <p className="alert alert-danger">
                        {this.state.error.toString()}
                    </p>
                )}
            </form>
        );
    }
}
