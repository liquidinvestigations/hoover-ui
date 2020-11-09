import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from 'next/link';
import { Grid, TextField, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import {
    fetchCollections,
    parseSearchUrlQuery,
    search,
    updateSearchQuery,
    fetchNextDoc,
    fetchPreviousDoc,
} from '../actions';

import { SEARCH_GUIDE } from '../constants';
import SearchLeftDrawer from './SearchLeftDrawer';
import SearchResults from './SearchResults';
import SearchRightDrawer from './SearchRightDrawer';
import SearchSettings from './SearchSettings';
import SplitPaneLayout from './SplitPaneLayout';
import HotKeys from './HotKeys';
import ErrorBoundary from './ErrorBoundary';
import { isInputFocused, copyMetadata } from '../utils';

const styles = theme => ({
    error: {
        paddingTop: theme.spacing(3),
    },
    main: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    paper: {
        position: 'absolute',
        width: theme.spacing(50),
        backgroundColor: theme.palette.background.paper,
        boxShadow: theme.shadows[5],
        padding: theme.spacing(4),
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

    keys = [
        {
            name: 'nextItem',
            key: 'j',
            help: 'Preview next result',
            handler: () => {
                if (!isInputFocused()) {
                    this.props.dispatch(fetchNextDoc());
                }
            },
        },
        {
            name: 'previousItem',
            key: 'k',
            help: 'Preview the previous result',
            handler: () => {
                if (!isInputFocused()) {
                    this.props.dispatch(fetchPreviousDoc());
                }
            },
        },

        {
            name: 'copyMetadata',
            key: 'c',
            help:
                'Copy metadata (MD5 and path) of the currently previewed item to the clipboard.',
            handler: (e, showMessage) => {
                if (isInputFocused()) {
                    return;
                }

                e.preventDefault();

                if (this.props.docData && this.props.docData.content) {
                    showMessage(copyMetadata(this.props.docData));
                } else {
                    showMessage('Unable to copy metadata – no document selected?');
                }
            },
        },

        {
            name: 'openItem',
            key: 'o',
            help: 'Open the currently previewed result',
            handler: e => {
                isInputFocused() || window.open(this.props.docUrl, '_blank');
            },
        },

        {
            name: 'focusInputField',
            key: '/',
            help: 'Focus the search field',
            handler: e => {
                if (!isInputFocused()) {
                    e.preventDefault();
                    this.inputElement.current && this.inputElement.current.focus();
                }
            },
        },
    ];

    inputElement = createRef();

    async componentDidMount() {
        const { dispatch } = this.props;

        await dispatch(fetchCollections());
        dispatch(parseSearchUrlQuery());
    }

    componentDidUpdate(prevProps, prevState) {
        const isInitialQueryParse =
            !prevProps.wasQueryParsed && this.props.wasQueryParsed;

        if (isInitialQueryParse && this.props.query.q && this.props.query.q.length) {
            this.props.dispatch(search());
        }
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

        return (
            <ErrorBoundary>
                <HotKeys keys={this.keys} focused>
                    <SplitPaneLayout
                        left={<SearchLeftDrawer />}
                        right={<SearchRightDrawer />}>
                        <div className={classes.main}>
                            <Grid container>
                                <Grid item sm={12}>
                                    <form onSubmit={this.handleSubmit}>
                                        <TextField
                                            inputRef={this.inputElement}
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
                                                <a href={SEARCH_GUIDE}>
                                                    this handy guide
                                                </a>
                                                .
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
                                    <Typography color="error">
                                        {error.toString()}
                                    </Typography>
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
                </HotKeys>
            </ErrorBoundary>
        );
    }
}

const mapStateToProps = ({
    search,
    collections: { selected },
    doc: { url: docUrl, data: docData },
}) => ({
    ...search,
    selectedCollections: selected,
    docUrl,
    docData,
});

export default withStyles(styles)(connect(mapStateToProps)(SearchPage));
