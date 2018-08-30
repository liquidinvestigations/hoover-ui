import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import Link from 'next/link';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import {
    fetchCollections,
    parseSearchUrlQuery,
    search,
    updateSearchQuery,
} from '../actions';
import { SEARCH_GUIDE } from '../constants';
import SearchLeftDrawer from './SearchLeftDrawer';
import SearchResults from './SearchResults';
import SearchRightDrawer from './SearchRightDrawer';
import SearchSettings from './SearchSettings';
import SplitPaneLayout from './SplitPaneLayout';

const styles = theme => ({
    error: {
        paddingTop: theme.spacing.unit * 2,
    },
    main: {
        paddingLeft: theme.spacing.unit * 3,
        paddingRight: theme.spacing.unit * 3,
    },
});

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

    state = {};

    async componentDidMount() {
        const { dispatch } = this.props;

        await dispatch(fetchCollections());
        dispatch(parseSearchUrlQuery());
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            prevProps.selectedCollections.length === 0 &&
            this.props.selectedCollections.length &&
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
        const { error: localError } = this.state;

        if (localError) {
            return <Typography color="error">{localError.toString()}</Typography>;
        }

        return (
            <SplitPaneLayout
                left={<SearchLeftDrawer />}
                right={<SearchRightDrawer />}>
                <div className={classes.main}>
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

                    {error && (
                        <div className={classes.error}>
                            <Typography color="error">{error.toString()}</Typography>
                        </div>
                    )}

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
            </SplitPaneLayout>
        );
    }
}

const mapStateToProps = ({ search, collections: { selected } }) => ({
    ...search,
    selectedCollections: selected,
});

export default withStyles(styles)(connect(mapStateToProps)(SearchPage));
