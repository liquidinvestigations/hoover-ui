import { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';

const defaultBucketSorter = (a, b) => b.doc_count - a.doc_count;

export default class AggregationFilter extends Component {
    static propTypes = {
        aggregation: PropTypes.shape({
            buckets: PropTypes.array.isRequired,
        }),
        title: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        selected: PropTypes.array,
        bucketLabel: PropTypes.func,
        bucketValue: PropTypes.func,
        sortBuckets: PropTypes.func,
    };

    handleChange = event => {
        const selected = new Set(this.props.selected || []);

        if (event.target.checked) {
            selected.add(event.target.value);
        } else {
            selected.delete(event.target.value);
        }

        this.props.onChange(Array.from(selected));
    };

    renderBucket = bucket => {
        const label = this.props.bucketLabel
            ? this.props.bucketLabel(bucket)
            : bucket.key;

        const value = this.props.bucketValue
            ? this.props.bucketValue(bucket)
            : bucket.key;

        const checked = this.props.selected.includes(value);

        return (
            <div key={bucket.key}>
                <Grid container justify="space-between" alignItems="center">
                    <Grid item>
                        <FormControlLabel
                            label={label}
                            control={
                                <Checkbox
                                    value={value}
                                    checked={checked}
                                    disabled={!bucket.doc_count}
                                    onChange={this.handleChange}
                                />
                            }
                        />
                    </Grid>

                    <Grid item>
                        <Typography variant="caption">{bucket.doc_count}</Typography>
                    </Grid>
                </Grid>
            </div>
        );
    };

    reset = () => this.props.onChange([]);

    render() {
        const { aggregation, title, selected } = this.props;

        let buckets = aggregation && aggregation.buckets ? aggregation.buckets : [];

        if (!buckets.length) {
            return null;
        }

        buckets = buckets
            .sort(this.props.sortBuckets || defaultBucketSorter)
            .filter(d => d.doc_count);

        return (
            <List subheader={title ? <ListSubheader>{title}</ListSubheader> : null}>
                <div>{buckets.map(this.renderBucket)}</div>

                <div style={{ padding: '1rem 0' }}>
                    {!!selected.length && (
                        <Button
                            variant="outlined"
                            size="small"
                            fullWidth
                            onClick={this.reset}>
                            Reset
                        </Button>
                    )}
                </div>
            </List>
        );
    }
}
