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
    };

    handleNext = e => {
        e.preventDefault();

        const { dispatch, query } = this.props;
        dispatch(updateSearchQuery({ page: query.page + 1 }));
    };

    handlePrev = e => {
        e.preventDefault();

        const { dispatch, query } = this.props;
        dispatch(updateSearchQuery({ page: query.page - 1 }));
    };

    render() {
        const { results, query } = this.props;

        const total = results.hits.total;
        const pageCount = Math.ceil(total / query.size);
        const page = results.hits.total ? query.page : 0;

        const hasNext = page < pageCount;
        const hasPrev = page > 1;

        return (
            <Grid container alignItems="center" justify="space-between">
                <Grid item>
                    <Typography variant="caption">
                        {results.hits.hits.length} of {total} hits – page {page} / {
                            pageCount
                        }
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

                        <IconButton onClick={this.handleNext} disabled={!hasNext}>
                            <IconNext />
                        </IconButton>
                    </Grid>
                </Grid>
            </Grid>
        );
    }
}

const mapStateToProps = ({ search: { results, query } }) => ({ results, query });

export default connect(mapStateToProps)(Pagination);
