import { Component } from 'react';
import cn from 'classnames';
import equal from 'fast-deep-equal';
import PropTypes from 'prop-types';

import Link from 'next/link';
import Router from 'next/router';

import { connect } from 'react-redux';
import {
    parseSearchUrlQuery,
    updateSearchQuery,
    writeSearchQueryToUrl,
    search,
    fetchCollections,
} from '../actions';

import Dropdown from './Dropdown';
import CollectionsBox from './CollectionsBox';
import SearchResults from './SearchResults';
import SearchSettings from './SearchSettings';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
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

const styles = theme => ({});

class SearchPage extends Component {
    static propTypes = {
        isFetching: PropTypes.bool.isRequired,
        results: PropTypes.shape({
            hits: PropTypes.shape({
                hits: PropTypes.array,
            }).isRequired,
        }).isRequired,
        query: PropTypes.object.isRequired,
        error: PropTypes.object,
        selectedCollections: PropTypes.arrayOf(PropTypes.string),
    };

    state = { initialSearch: true };

    componentDidMount() {
        this.props.dispatch(parseSearchUrlQuery());
        this.props.dispatch(fetchCollections());
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevProps.selectedCollections.length === 0 &&
            this.props.selectedCollections.length &&
            this.state.initialSearch &&
            this.props.query.q &&
            this.props.query.q.length
        ) {
            this.props.dispatch(search());
        }
    }

    componentDidCatch(error, info) {
        this.setState({ error });
    }

    handleInputChange = event =>
        this.props.dispatch(
            updateSearchQuery({ q: event.target.value }, { syncUrl: false })
        );

    handleSubmit = event => {
        event.preventDefault();
        this.props.dispatch(updateSearchQuery({}, { resetPagination: true }));
    };

    render() {
        const { classes, error, query, isFetching, results } = this.props;

        if (error) {
            return <Typography color="error">{error.toString()}</Typography>;
        }

        return (
            <div>
                <Grid container>
                    <Grid item sm={12}>
                        <form onSubmit={this.handleSubmit}>
                            <TextField
                                name="q"
                                value={query.q || ''}
                                onChange={this.handleInputChange}
                                label="Search"
                                margin="normal"
                                fullWidth
                                type="search"
                                autoFocus
                            />
                        </form>

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

                <Grid container>
                    <Grid item sm={12}>
                        <SearchResults
                            isFetching={isFetching}
                            results={results}
                            query={query}
                        />
                    </Grid>
                </Grid>
            </div>
        );
    }
}

const mapStateToProps = ({ search, collections: { selected } }) => ({
    ...search,
    selectedCollections: selected,
});

export default withStyles(styles)(connect(mapStateToProps)(SearchPage));
