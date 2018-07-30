import { Component } from 'react';
import PropTypes from 'prop-types';
import cn from 'classnames';

const defaultBucketSorter = (a, b) => b.key - a.key;

export default class AggregationFilter extends Component {
    static propTypes = {
        aggregation: PropTypes.shape({
            buckets: PropTypes.array.isRequired,
        }),
        title: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        selected: PropTypes.array,
        bucketLabel: PropTypes.func,
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
        const formatted = this.props.bucketLabel
            ? this.props.bucketLabel(bucket)
            : bucket.key;

        const checked = this.props.selected.includes(formatted);

        return (
            <li
                className={cn('checkbox', { 'text-muted': !bucket.doc_count })}
                key={bucket.key}>
                <label className="d-flex justify-content-between">
                    <div>
                        <input
                            disabled={!bucket.doc_count}
                            type="checkbox"
                            value={formatted}
                            className="mr-2"
                            checked={checked}
                            onChange={this.handleChange}
                        />
                        {formatted}
                    </div>
                    <div className="text-muted">
                        <small>{bucket.doc_count}</small>
                    </div>
                </label>
            </li>
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
            <div className="mt-2">
                <div className="d-flex justify-content-between">
                    <div>
                        <small className="text-muted">{title || ' '}</small>
                    </div>
                    <div>
                        {!!selected.length && (
                            <a href="#" onClick={this.reset} className="reset">
                                Reset
                            </a>
                        )}
                    </div>
                </div>

                <ul className="list-unstyled">{buckets.map(this.renderBucket)}</ul>
            </div>
        );
    }
}
