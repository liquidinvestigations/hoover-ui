import { Component } from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import Link from 'next/link';
import Modal from 'react-modal';
import { DateTime } from 'luxon';
import ReactPlaceholder from 'react-placeholder';
import FileTypeFilter from './FileTypeFilter';
import Document from './Document';
import ResultItem from './ResultItem';
import Pagination from './Pagination';
import Filter from './Filter';
import AggregationFilter from './AggregationFilter';
import DateRangeFilter from './DateRangeFilter';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

Modal.setAppElement('body');

const documentViewUrl = item => `doc/${item._collection}/${item._id}`;

export default class SearchResults extends Component {
    static propTypes = {
        query: PropTypes.object.isRequired,
        results: PropTypes.object,
        isFetching: PropTypes.bool.isRequired,
        onFilter: PropTypes.func.isRequired,
        onNextPage: PropTypes.func.isRequired,
        onPrevPage: PropTypes.func.isRequired,
    };

    state = { preview: null, error: null };

    clearPreview = () => this.setState({ preview: null });
    setPreview = url => this.setState({ preview: url });

    // handleFileTypeFilter = fileTypes => this.props.onFilter({ filetype: fileTypes });
    // handleDateFilter = years => this.props.onFilter({ date: years });
    // handleDateCreatedFilter = years =>
    //     this.props.onFilter({ 'date-created': years });

    // handleDateRangeFilter = ({ from, to }) =>
    //     this.props.onFilter({ date: [from, to] });

    componentDidCatch(error, info) {
        this.setState({ error: error });
    }

    render() {
        if (this.state.error) {
            return (
                <Typography color="error">
                    ERROR: {this.state.error.toString()}
                </Typography>
            );
        }

        const { results, query, onFilter, isFetching } = this.props;

        if (!results.hits.hits) {
            return null;
        }

        const start = 1 + (query.page - 1) * query.size;

        let resultList = null;

        if (results.hits.total > 0) {
            const items = results.hits.hits.map((hit, i) => {
                const url = documentViewUrl(hit);
                return (
                    <ResultItem
                        key={hit._url}
                        hit={hit}
                        url={url}
                        n={start + i}
                        unsearchable={this.state.preview}
                        onPreview={this.setPreview}
                        isSelected={url == this.state.preview}
                    />
                );
            });

            resultList = (
                <Grid item id="results">
                    {' '}
                    {items}
                </Grid>
            );
        } else {
            resultList = null;
        }

        const preview = this.state.preview;
        const previewUrl = preview && url.resolve(window.location.href, preview);

        const aggregations = results.aggregations || {};

        return (
            <Grid container spacing={8}>
                <Grid item>
                    <ReactPlaceholder
                        showLoadingAnimation
                        ready={!this.props.isFetching}
                        type="text"
                        rows={
                            resultList && resultList.length ? resultList.length : 10
                        }>
                        <Pagination {...this.props} />

                        <Grid container>{resultList}</Grid>

                        {resultList && <Pagination {...this.props} />}
                    </ReactPlaceholder>
                </Grid>

                <Modal
                    isOpen={!!preview}
                    ariaHideApp={false}
                    style={{
                        overlay: { zIndex: 1, backgroundColor: 'rgba(0,0,0,0.5)' },
                        content: {
                            background: '#eee',
                            border: 'none',
                            borderRadius: 0,
                            left: '50%',
                            top: 0,
                            right: 0,
                            bottom: 0,
                        },
                    }}
                    closeTimeMS={200}
                    onRequestClose={this.clearPreview}>
                    {preview && (
                        <Document
                            docUrl={previewUrl}
                            collectionBaseUrl={url.resolve(previewUrl, './')}
                        />
                    )}
                </Modal>
            </Grid>
        );
    }
}
