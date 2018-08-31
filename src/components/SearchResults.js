import Typography from '@material-ui/core/Typography';
import PropTypes from 'prop-types';
import { Component } from 'react';
import ReactPlaceholder from 'react-placeholder';
import url from 'url';
import Pagination from './Pagination';
import ResultItem from './ResultItem';

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

        const { results, query, isFetching } = this.props;

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

        return (
            <div>
                <Pagination />

                <ReactPlaceholder
                    showLoadingAnimation
                    ready={!isFetching}
                    type="text"
                    rows={10}>
                    {resultList}

                    {!!resultList.length && <Pagination />}
                </ReactPlaceholder>
            </div>
        );
    }
}
