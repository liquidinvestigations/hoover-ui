import { Component } from 'react';

import Link from 'next/link';

import CollectionsBox from './CollectionsBox';
import Filter from './Filter';
import Batch from './Batch';

import { connect } from 'react-redux';

import { fetchCollections, fetchBatchLimits } from '../actions';

import List from '@material-ui/core/List';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
    toolbar: theme.mixins.toolbar,
    main: {
        paddingLeft: theme.spacing.unit * 3,
        paddingRight: theme.spacing.unit * 3,
    },
});

class BatchPage extends Component {
    state = {
        terms: '',
    };

    async componentDidMount() {
        await this.getCollectionsAndLimits();
    }

    componentDidCatch(error) {
        this.setState({ error });
    }

    async getCollectionsAndLimits() {
        const { dispatch } = this.props;
        dispatch(fetchCollections());
        dispatch(fetchBatchLimits());
    }

    buildQuery(termsString, batchSize) {
        if (!termsString.trim()) return null;
        if (!this.props.selectedCollections) return null;

        return {
            terms: termsString.trim().split('\n'),
            collections: this.props.selectedCollections,
            batchSize: batchSize,
        };
    }

    onSearch = e => {
        e.preventDefault();
        this.setState({
            terms: this.state.query,
        });
    };

    render() {
        const { classes, limits, error, isFetching } = this.props;

        if (!limits) {
            return <p>loading ...</p>;
        }

        if (error) {
            return <div>{error.toString()}</div>;
        }

        const { terms } = this.state;
        const batchSize = limits.batch;
        const query = this.buildQuery(terms, batchSize);

        let limitsMessage = null;

        if (limits && limits.requests) {
            let count = limits.batch * limits.requests.limit;
            let timeout = limits.requests.interval;
            limitsMessage = (
                <span className="batch-rate-limit-message">
                    <Typography>
                        rate limit: {count} terms every {timeout} seconds
                    </Typography>
                </span>
            );
        }

        return (
            <form id="batch-form" ref="form">
                <div className={classes.toolbar} />
                <Grid container>
                    <Grid item sm={4}>
                        <List dense>
                            <Filter
                                title="Collections"
                                defaultOpen
                                colorIfFiltered={false}>
                                <CollectionsBox />
                            </Filter>
                        </List>
                    </Grid>
                    <Grid item sm={8}>
                        <div className={classes.main}>
                            <TextField
                                id="multiline-flexible"
                                label="Batch search queries (one per line)"
                                multiline
                                fullWidth
                                autoFocus
                                rows="4"
                                rowsMax={batchSize || Infinity}
                                value={this.state.query}
                                onChange={e =>
                                    this.setState({ query: e.target.value })
                                }
                                className={classes.textField}
                                margin="normal"
                            />

                            <Grid container justify="space-between">
                                <Grid item>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        disabled={isFetching}
                                        color="primary"
                                        onClick={this.onSearch}>
                                        Batch search
                                    </Button>
                                </Grid>
                                <Grid item>
                                    <Link href="/">
                                        <a>
                                            <Typography>
                                                Back to single search
                                            </Typography>
                                        </a>
                                    </Link>
                                </Grid>
                            </Grid>

                            <Typography>{limitsMessage}</Typography>

                            <Batch query={query} />
                        </div>
                    </Grid>
                </Grid>
            </form>
        );
    }
}

const mapStateToProps = ({
    batch: { limits, error, isFetching },
    collections: { selected: selectedCollections },
}) => ({
    limits,
    error,
    isFetching,
    selectedCollections,
});
export default withStyles(styles)(connect(mapStateToProps)(BatchPage));
