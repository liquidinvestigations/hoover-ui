import { Component } from 'react';
import PropTypes from 'prop-types';
import url from 'url';
import cn from 'classnames';
import Link from 'next/link';
import Modal from 'react-modal';

import Charts from './Charts';
import Document from './Document';
import ResultItem from './ResultItem';
import Pagination from './Pagination';

function documentViewUrl(item) {
    return 'doc/' + item._collection + '/' + item._id;
}

export default class SearchResults extends Component {
    static propTypes = {
        query: PropTypes.object.isRequired,
        results: PropTypes.object,
        onFilter: PropTypes.func.isRequired,
        onNextPage: PropTypes.func.isRequired,
        onPrevPage: PropTypes.func.isRequired,
    };

    state = { preview: null };

    clearPreview = () => this.setState({ preview: null });
    setPreview = url => this.setState({ preview: url });

    render() {
        const { results, query, onFilter } = this.props;

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

        return (
            <div className="row">
                <div className="col-sm-2">
                    <Charts
                        aggregations={results.aggregations || {}}
                        onSelect={onFilter}
                    />
                </div>

                <div className="col-sm-10">
                    <div className="results-search">
                        <Pagination {...this.props} />

                        {resultList}

                        {resultList && <Pagination {...this.props} />}
                    </div>
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
