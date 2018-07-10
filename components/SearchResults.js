import { Component } from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import cn from 'classnames';
import Link from 'next/link';
import Modal from 'react-modal';

import ReactPlaceholder from 'react-placeholder';

import Charts from './Charts';
import Document from './Document';
import ResultItem from './ResultItem';
import Pagination from './Pagination';
import YearFilter from './YearFilter';

function documentViewUrl(item) {
    return 'doc/' + item._collection + '/' + item._id;
}

Modal.setAppElement('body');

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

    handleDateFilter = years => this.props.onFilter({ date: years });
    handleDateCreatedFilter = years =>
        this.props.onFilter({ 'date-created': years });

    componentDidCatch(error, info) {
        this.setState({ error: error });
    }

    render() {
        if (this.state.error) {
            return (
                <p className="alert alert-danger">
                    ERROR: {this.state.error.toString()}
                </p>
            );
        }

        const { results, query, onFilter, isFetching } = this.props;

        if (!results) {
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
                        onPreview={this.setPreview}
                        isSelected={url == this.state.preview}
                    />
                );
            });

            resultList = <ul id="results"> {items} </ul>;
        } else {
            resultList = null;
        }

        const preview = this.state.preview;
        const previewUrl = preview && url.resolve(window.location.href, preview);

        const aggregations = results.aggregations || {};

        return (
            <div className="row">
                <div className="col-sm-2">
                    <Charts aggregations={aggregations} onSelect={onFilter} />

                    <YearFilter
                        aggregation={aggregations.count_by_date_year}
                        title="Year"
                        selected={query.dateYears}
                        onChange={this.handleDateFilter}
                    />
                    <YearFilter
                        aggregation={aggregations.count_by_date_created_year}
                        selected={query.dateCreatedYears}
                        title="Year created"
                        onChange={this.handleDateCreatedFilter}
                    />
                </div>

                <div className="col-sm-10">
                    <ReactPlaceholder
                        showLoadingAnimation
                        ready={!this.props.isFetching}
                        type="text"
                        rows={10}>
                        <div className="results-search">
                            <Pagination {...this.props} />

                            {resultList}

                            {resultList && <Pagination {...this.props} />}
                        </div>
                    </ReactPlaceholder>
                </div>

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
                            // animation: 'slideIn .2s ease-in-out',
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
            </div>
        );
    }
}
