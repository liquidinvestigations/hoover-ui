import { Component } from 'react';
import classNames from 'classnames';
import api from '../api';

export default class Batch extends Component {
    state = {
        searching: false,
        error: null,
        results: null,
        query: null,
    };

    performBatchSearch(query) {
        if (!query) {
            return;
        }
        if (this.state.query === query) {
            return;
        }

        this.setState(
            {
                searching: true,
                query: query,
                batchOffset: 0,
                results: [],
                error: null,
            },
            () => {
                this.batchSearch();
            }
        );
    }

    async batchSearch() {
        let offset = this.state.batchOffset;
        let { terms, collections, batchSize } = this.state.query;
        let termsPage = terms.slice(offset, offset + batchSize);

        try {
            this.onResults(
                await api.batch({
                    query_strings: termsPage,
                    collections: collections,
                })
            );
        } catch (err) {
            this.onError(res);
        }
    }

    onResults(resp) {
        if (resp.status == 'error') {
            return this.onError(resp);
        }

        var url = function(term) {
            var u = './?q=' + encodeURIComponent(term);
            let collections = this.state.query.collections;
            if (collections) {
                u += '&collections=' + collections.map(encodeURIComponent).join('+');
            }
            return u;
        }.bind(this);

        let newResults = resp.responses.map(r => {
            let rv = {
                term: r._query_string,
                url: url(r._query_string),
            };
            if (r.error) {
                console.error(r.error);
                rv.error = true;
            } else {
                rv.count = r.hits.total;
            }
            return rv;
        });

        this.setState({
            results: [].concat(this.state.results, newResults),
        });

        let offset = this.state.batchOffset;
        let size = this.state.query.batchSize;
        let nextOffset = offset + size;

        if (nextOffset >= this.state.query.terms.length) {
            this.setState({
                searching: false,
            });
        } else {
            this.setState(
                {
                    batchOffset: nextOffset,
                },
                () => {
                    this.batchSearch();
                }
            );
        }
    }

    onError(err) {
        console.error(err);

        let reason = err.statusText;
        if (err.status == 429) reason = 'Rate limit exceeded';
        if (!reason) reason = 'Unknown server error while searching';

        this.setState({
            searching: false,
            error: reason,
        });
    }

    componentDidMount() {
        this.performBatchSearch(this.props.query);
    }

    componentWillReceiveProps(props) {
        this.performBatchSearch(props.query);
    }

    render() {
        let renderResult = ({ url, term, error, count }) => {
            let result;
            if (error) {
                result = (
                    <span className="batch-results-result error-result">error</span>
                );
            } else {
                result = <span className="batch-results-result">{count} hits</span>;
            }

            return (
                <li key={url} className={classNames({ 'no-hits': count == 0 })}>
                    <h3>
                        <a href={url} target="_blank" className="batch-results-link">
                            {result}
                            {term}
                        </a>
                    </h3>
                </li>
            );
        };

        let resultList = null;
        let results = this.state.results;
        let inf = 1 / 0;
        let getCount = r => (r.count === undefined ? inf : r.count);
        let desc = (a, b) => getCount(b) - getCount(a);
        if (results) {
            resultList = (
                <ul id="batch-results">{results.sort(desc).map(renderResult)}</ul>
            );
        }

        let progressMessage = '';
        if (this.state.searching) {
            let offset = this.state.batchOffset;
            let batchSize = this.state.query.batchSize;
            let terms = this.state.query.terms;
            let page = offset / batchSize;
            let total = Math.ceil(terms.length / batchSize);
            progressMessage = `Loading, ${page} of ${total}`;
        }
        if (this.state.error) {
            progressMessage = `Batch search error: ${this.state.error}`;
        }

        return (
            <div className="batch-results col-sm-10">
                <p style={{ float: 'right' }}>{progressMessage}</p>
                {resultList}
            </div>
        );
    }
}
