import { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Grid from '@material-ui/core/Grid';

export default class Pagination extends Component {
    static propTypes = {
        onNextPage: PropTypes.func.isRequired,
        onPrevPage: PropTypes.func.isRequired,
    };

    collectionTitle(name) {
        const col = (this.props.query.collections || []).find(c => c.name === name);

        if (col) {
            return col.title;
        }

        return name;
    }

    handleNext = e => {
        e.preventDefault();
        this.props.onNextPage();
    };

    handlePrev = e => {
        e.preventDefault();
        this.props.onPrevPage();
    };

    render() {
        const { results, query } = this.props;

        const total = results.hits.total;
        const pageCount = Math.ceil(total / query.size);
        const page = results.hits.total ? query.page : 0;

        const hasNext = page < pageCount;
        const hasPrev = page > 1;

        let countByIndex = null;

        const counts = results.count_by_index;

        return (
            <Grid container alignItems="baseline" justify="space-between">
                <Grid item>
                    <span className="text-muted" style={{ fontWeight: 300 }}>
                        {results.hits.hits.length} of {total} hits – page {page} / {
                            pageCount
                        }
                    </span>
                </Grid>

                <Grid item>
                    <ul className="pagination">
                        <li
                            className={cn('page-item', {
                                disabled: !hasPrev,
                            })}>
                            <a
                                className="page-link"
                                tabIndex="-1"
                                onClick={this.handlePrev}>
                                Previous
                            </a>
                        </li>

                        <li
                            className={cn('page-item', {
                                disabled: !hasNext,
                            })}>
                            <a className="page-link" onClick={this.handleNext}>
                                Next
                            </a>
                        </li>
                    </ul>
                </Grid>
            </Grid>
        );
    }
}
