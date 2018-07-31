import { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import IconPrevious from '@material-ui/icons/NavigateBefore';
import IconNext from '@material-ui/icons/NavigateNext';

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
            <Grid container alignItems="center" justify="flex-start">
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
