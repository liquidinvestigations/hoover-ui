import { Component } from 'react';
import qs from 'qs';
import cn from 'classnames';
import equal from 'fast-deep-equal';
import PropTypes from 'prop-types';

import Link from 'next/link';
import Router from 'next/router';

import { connect } from 'react-redux';
import { fetchCollections } from '../actions';

import api from '../api';
import routerEvents from '../router-events';

import Dropdown from './Dropdown';
import CollectionsBox from './CollectionsBox';
import SearchResults from './SearchResults';
import SearchSettings from './SearchSettings';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Drawer from '@material-ui/core/Drawer';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { pickBy, identity, castArray } from 'lodash';

import {
    SORT_RELEVANCE,
    SORT_NEWEST,
    SORT_OLDEST,
    SORT_OPTIONS,
    SEARCH_GUIDE,
    SIZE_OPTIONS,
} from '../constants';

const drawerWidth = 240;

const styles = theme => ({
    drawerPaper: {
        position: 'relative',
        width: drawerWidth,
    },
});

class SearchPage extends Component {
    static propTypes = {
        isFetching: PropTypes.bool.isRequired,
        result: PropTypes.shape({
            hits: PropTypes.shape({
                hits: PropTypes.array,
            }).isRequired,
        }).isRequired,
    };

    state = {
        query: {},
        searchAfterByPage: {},
        error: null,
    };

    componentDidMount() {
        console.log(this.props);
        const { dispatch } = this.props;

        dispatch(fetchCollections());

        this.setState({ query: this.parseQueryFromUrl() }, async () => {
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
        this.setState({
            query: {
                ...this.state.query,
            },
        });
    }

    setSize = event => {
        const { query } = this.state;

        this.setState(
            {
                query: {
                    ...query,
                    size: event.target.value,
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
                    order: event.target.value,
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
                if (order !== SORT_RELEVANCE) {
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

        const { classes } = this.props;

        if (error) {
            return <Typography color="error">{error.toString()}</Typography>;
        }

        return (
            <div>
                <Grid container>
                    <Grid item lg={8} sm={12}>
                        <TextField
                            name="q"
                            value={q || ''}
                            onChange={this.handleInputChange}
                            label="Search"
                            margin="normal"
                            fullWidth
                            type="search"
                            autoFocus
                        />

                        <Grid container justify="space-between">
                            <Grid item>
                                <Typography variant="caption">
                                    Refine your search using{' '}
                                    <a href={SEARCH_GUIDE}>this handy guide</a>.
                                </Typography>
                            </Grid>

                            <Grid item>
                                <Typography variant="caption">
                                    <Link href="/batch-search">
                                        <a>Batch search</a>
                                    </Link>
                                </Typography>
                            </Grid>
                        </Grid>

                        <SearchSettings />
                    </Grid>
                </Grid>

                <SearchResults
                    isFetching={this.props.isFetching}
                    results={this.state.results}
                    query={this.state.query}
                    onNextPage={this.loadNextPage}
                    onPrevPage={this.loadPrevPage}
                    onFilter={this.handleFilter}
                />
            </div>
        );
    }
}

const mapStateToProps = ({ search }) => search;

export default withStyles(styles)(connect(mapStateToProps)(SearchPage));
