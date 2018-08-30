import { Component } from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import ListSubheader from '@material-ui/core/ListSubheader';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';

import { formatThousands } from '../utils';

const defaultBucketSorter = (a, b) => b.doc_count - a.doc_count;

const styles = theme => ({
    root: {},
    label: {
        overflowX: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
});

class AggregationFilter extends Component {
    static propTypes = {
        aggregation: PropTypes.shape({
            buckets: PropTypes.array.isRequired,
        }),
        cardinality: PropTypes.shape({
            value: PropTypes.number.isRequired,
        }),
        size: PropTypes.number,
        title: PropTypes.string,
        onChange: PropTypes.func.isRequired,
        onLoadMore: PropTypes.func,
        selected: PropTypes.array,
        bucketLabel: PropTypes.func,
        bucketValue: PropTypes.func,
        sortBuckets: PropTypes.func,
        classes: PropTypes.object.isRequired,
    };

    state = { checked: [] };

    handleChange = value => () => {
        const selected = new Set(this.props.selected || []);

        if (selected.has(value)) {
            selected.delete(value);
        } else {
            selected.add(value);
        }

        this.props.onChange(Array.from(selected));
    };

    renderBucket = bucket => {
        const { bucketLabel, bucketValue, selected, classes, disabled } = this.props;

        const label = bucketLabel ? bucketLabel(bucket) : bucket.key;
        const value = bucketValue ? bucketValue(bucket) : bucket.key;
        const checked = selected.includes(value);

        if (!checked && !bucket.doc_count) {
            return null;
        }

        return (
            <ListItem
                key={bucket.key}
                role={undefined}
                classes={{
                    root: classes.root,
                }}
                dense
                button
                onClick={this.handleChange(value)}>
                <Checkbox
                    tabIndex={-1}
                    disableRipple
                    value={value}
                    checked={checked}
                    disabled={disabled || !bucket.doc_count}
                    onChange={this.handleChange(value)}
                />

                <ListItemText primary={label} className={classes.label} />

                <ListItemText
                    primary={
                        <Typography variant="caption">
                            {formatThousands(bucket.doc_count)}
                        </Typography>
                    }
                    disableTypography
                    align="right"
                />
            </ListItem>
        );
    };

    reset = () => this.props.onChange([]);

    render() {
        const {
            aggregation,
            title,
            selected,
            cardinality,
            onLoadMore,
            size,
            disabled,
        } = this.props;

        const buckets = (aggregation && aggregation.buckets
            ? aggregation.buckets
            : []
        ).sort(this.props.sortBuckets || defaultBucketSorter);

        if (!buckets.length) {
            return null;
        }

        return (
            <List subheader={title ? <ListSubheader>{title}</ListSubheader> : null}>
                {buckets.map(this.renderBucket).filter(Boolean)}

                <ListItem dense>
                    <Grid container alignItems="center" justify="space-between">
                        <Grid item>
                            {onLoadMore &&
                            cardinality &&
                            size &&
                            cardinality.value > size ? (
                                <Button
                                    size="small"
                                    disabled={disabled}
                                    variant="flat"
                                    onClick={onLoadMore}>
                                    More ({cardinality.value - size})
                                </Button>
                            ) : null}
                        </Grid>

                        <Grid item>
                            <Button
                                size="small"
                                variant="flat"
                                disabled={disabled || !selected.length}
                                onClick={this.reset}>
                                Reset
                            </Button>
                        </Grid>
                    </Grid>
                </ListItem>
            </List>
        );
    }
}

export default withStyles(styles)(AggregationFilter);
