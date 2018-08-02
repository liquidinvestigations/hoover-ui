import { Component } from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import IconPrevious from '@material-ui/icons/NavigateBefore';
import IconNext from '@material-ui/icons/NavigateNext';

import { connect } from 'react-redux';
import { updateSearchQuery } from '../actions';

export class Pagination extends Component {
    static propTypes = {
        results: PropTypes.object.isRequired,
        query: PropTypes.object.isRequired,
        searchAfterByPage: PropTypes.object.isRequired,
    };

    handleNext = e => {
        e.preventDefault();

        const { dispatch, query, searchAfterByPage } = this.props;

        dispatch(
            updateSearchQuery({
                page: query.page + 1,
                searchAfter: searchAfterByPage[query.page + 1],
            })
        );
    };

    handlePrev = e => {
        e.preventDefault();

        const { dispatch, query, searchAfterByPage } = this.props;

        dispatch(
            updateSearchQuery({
                page: query.page - 1,
                searchAfter: searchAfterByPage[query.page - 1],
            })
        );
    };

    render() {
        const {
            results,
            query: { page, size },
        } = this.props;

        const total = results.hits.total;
        const pageCount = Math.ceil(total / size);

        const from = total === 0 ? 0 : page * size - 9;
        const to = Math.min(total, page * size);

        const hasNext = page < pageCount;
        const hasPrev = page > 1;

        return (
            <div style={{ marginTop: '1rem' }}>
                <Grid container alignItems="center" justify="space-between">
                    <Grid item>
                        <Typography variant="caption">
                            Showing {from} - {to} of {total} hits page{' '}
                        </Typography>
                        <Typography variant="caption">
                            Page {total === 0 ? 0 : page} / {pageCount}
                        </Typography>
                    </Grid>

                    <Grid item>
                        <Grid container justify="flex-end">
                            <IconButton
                                tabIndex="-1"
                                onClick={this.handlePrev}
                                disabled={!hasPrev}>
                                <IconPrevious />
                            </IconButton>

                            <IconButton
                                onClick={this.handleNext}
                                disabled={!hasNext}>
                                <IconNext />
                            </IconButton>
                        </Grid>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

const mapStateToProps = ({ search: { results, query, searchAfterByPage } }) => ({
    results,
    query,
    searchAfterByPage,
});

export default connect(mapStateToProps)(Pagination);
