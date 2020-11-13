import React, { Component, createRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Link from 'next/link';
import ChipInput from 'material-ui-chip-input'
import { Grid, Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import {
    fetchCollections,
    parseSearchUrlQuery,
    search,
    updateSearchQuery,
    fetchNextDoc,
    fetchPreviousDoc,
} from '../actions';

import { SEARCH_GUIDE, SEARCH_QUERY_PREFIXES } from '../constants'
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
                    this.inputElement && this.inputElement.focus();
                }
            },
        },
    ];

    constructor(props) {
        super(props);

        this.inputElement = null;

        this.setInputElementRef = element => {
            this.inputElement = element;
        };

        const [chips, input] = this.extractChips(props.query.q)

        this.state ={
            input,
            chips
        }
    }

    async componentDidMount() {
        const { dispatch } = this.props;

        await dispatch(fetchCollections());
        dispatch(parseSearchUrlQuery());
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevProps.query?.q !== this.props.query.q) {
            const [chips, input] = this.extractChips(this.props.query.q)
            this.setState({
                ...this.state,
                input,
                chips
            })
            this.props.dispatch(search());
        }
    }

    handleInputChange = event => {
        this.setState({
            ...this.state,
            input: event.target.value
        })
    }

    handleSubmit = event => {
        event.preventDefault();
        const chipsQueryPart = this.state.chips.length ? this.state.chips.join(' ') + ' ' : ''
        this.props.dispatch(updateSearchQuery({
            q: chipsQueryPart + this.state.input
        }, { resetPagination: true }))
    }

    handleBeforeChipAdd = chip => {
        if (chip.indexOf(':') > 0) {
            const chipParts = chip.split(':')
            if (SEARCH_QUERY_PREFIXES.indexOf(chipParts[0]) >= 0 && chipParts[1].length > 0) {
                return true
            }
        }
        return false
    }

    handleChipAdd = chip => {
        this.setState({
            ...this.state,
            input: this.state.input.replace(chip, ''),
            chips: [...this.state.chips, chip]
        })
    }

    handleChipDelete = (chip, chipIndex) => {
        const chips = [...this.state.chips]
        chips.splice(chipIndex, 1)
        this.setState({
            ...this.state,
            chips
        })
    }

    extractChips = query => {
        const chips = []
        const queryParts = query ? query.match(/(?:[^\s"\[{]+|"[^"]*"|[\[{][^\]}]*[\]}])+/g) : []
        const otherInput = []
        queryParts.forEach(part => {
            if (part.indexOf(':') > 0) {
                const partParts = part.split(':')
                if (SEARCH_QUERY_PREFIXES.indexOf(partParts[0]) >= 0 && partParts[1].length > 0) {
                    chips.push(part)
                } else {
                    otherInput.push(part)
                }
            } else {
                otherInput.push(part)
            }
        })
        return [chips, otherInput.join(' ')]
    }

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
                                        <ChipInput
                                            inputRef={this.setInputElementRef}
                                            name="q"
                                            value={this.state.chips}
                                            inputValue={this.state.input}
                                            label="Search"
                                            type="search"
                                            margin="normal"
                                            autoFocus
                                            fullWidth
                                            fullWidthInput
                                            blurBehavior="ignore"
                                            dataSource={SEARCH_QUERY_PREFIXES}
                                            newChipKeyCodes={[]}
                                            newChipKeys={[]}
                                            onBeforeAdd={this.handleBeforeChipAdd}
                                            onAdd={this.handleChipAdd}
                                            onDelete={this.handleChipDelete}
                                            onUpdateInput={this.handleInputChange}
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
