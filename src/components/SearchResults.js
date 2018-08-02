import { Component } from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import Link from 'next/link';
// import Modal from 'react-modal';
import { DateTime } from 'luxon';
import ReactPlaceholder from 'react-placeholder';
import Document from './Document';
import ResultItem from './ResultItem';
import Pagination from './Pagination';
import Filter from './Filter';
import AggregationFilter from './AggregationFilter';
import DateRangeFilter from './DateRangeFilter';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';

const documentViewUrl = item => `doc/${item._collection}/${item._id}`;

export default class SearchResults extends Component {
    static propTypes = {
        query: PropTypes.object.isRequired,
        results: PropTypes.object,
        isFetching: PropTypes.bool.isRequired,
    };

    state = { error: null };

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

        const resultList = results.hits.hits.map((hit, i) => (
            <ResultItem
                key={hit._url}
                hit={hit}
                url={documentViewUrl(hit)}
                n={start + i}
            />
        ));

        const preview = this.state.preview;
        const previewUrl = preview && url.resolve(window.location.href, preview);

        return (
            <div>
                <ReactPlaceholder
                    showLoadingAnimation
                    ready={!this.props.isFetching}
                    type="text"
                    rows={10}>
                    <Pagination />

                    {resultList}

                    {!!resultList.length && <Pagination />}
                </ReactPlaceholder>
            </div>
        );
    }
}
