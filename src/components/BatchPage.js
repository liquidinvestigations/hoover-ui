import { Component } from 'react';
import Dropdown from './Dropdown';
import CollectionsBox from './CollectionsBox';
import Batch from './Batch';
import api from '../api';

class BatchPage extends Component {
    state = {
        terms: '',
        collections: null,
        selectedCollections: null,
        limits: null,
    };

    async componentDidMount() {
        await this.getCollectionsAndLimits();
    }

    async getCollectionsAndLimits() {
        const [collections, limits] = await Promise.all([
            api.collections(),
            api.limits(),
        ]);

        this.setState({
            collections,
            limits,
            selectedCollections: collections.map(c => c.name),
        });
    }

    buildQuery(termsString, selectedCollections, batchSize) {
        if (!termsString.trim()) return null;
        if (!selectedCollections.length) return null;

        return {
            terms: termsString.trim().split('\n'),
            collections: selectedCollections,
            batchSize: batchSize,
        };
    }

    render() {
        if (!(this.state.collections && this.state.limits)) {
            return <p>loading ...</p>;
        }

        let onChangeCollections = selected => {
            this.setState({ selectedCollections: selected });
        };

        let collectionsValue = this.state.selectedCollections.join(' ');
        let { terms, collections, selectedCollections, limits } = this.state;
        let batchSize = limits.batch;
        let query = this.buildQuery(terms, selectedCollections, batchSize);

        let onSearch = e => {
            e.preventDefault();
            this.setState({
                terms: (this.refs.terms || {}).value || '',
            });
        };

        let limitsMessage = null;
        if (limits && limits.requests) {
            let count = limits.batch * limits.requests.limit;
            let timeout = limits.requests.interval;
            limitsMessage = (
                <span className="batch-rate-limit-message">
                    rate limit: {count} terms every {timeout} seconds
                </span>
            );
        }

        return (
            <form id="batch-form" ref="form">
                <input type="hidden" value={collectionsValue} />
                <Grid container>
                    <Grid item sm={2}>
                        <CollectionsBox
                            collections={collections}
                            selected={selectedCollections}
                            onChange={onChangeCollections}
                        />
                    </Grid>
                    <Grid item sm={9}>
                        <div id="batch-input-box" className="form-group">
                            <textarea
                                id="batch-input-terms"
                                ref="terms"
                                className="form-control"
                                rows="8"
                                placeholder="search terms, one per line"
                            />
                        </div>
                        <div id="search-infotext" className="form-text text-muted">
                            <p id="search-back">
                                <a href="./">Back to single search</a>
                            </p>
                        </div>
                        <div className="form-inline">
                            <button className="btn btn-primary" onClick={onSearch}>
                                Batch search
                            </button>
                            {limitsMessage}
                        </div>
                        <Batch query={query} />
                    </Grid>
                </Grid>
            </form>
        );
    }
}

export default BatchPage;
