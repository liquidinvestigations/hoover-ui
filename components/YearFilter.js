import { Component } from 'react';
import PropTypes from 'prop-types';
import { DateTime } from 'luxon';
import cn from 'classnames';

export default class YearFilter extends Component {
    static propTypes = {
        aggregation: PropTypes.shape({
            buckets: PropTypes.array.isRequired,
        }),
        title: PropTypes.string.isRequired,
        onChange: PropTypes.func.isRequired,
        selected: PropTypes.array,
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
        const year = DateTime.fromISO(bucket.key_as_string).year.toString();
        const checked = this.props.selected.includes(year);
        const text = `${year} (${bucket.doc_count})`;

        return (
            <li
                className={cn('checkbox', { 'text-muted': !bucket.doc_count })}
                key={bucket.key}>
                <label>
                    <input
                        disabled={!bucket.doc_count}
                        type="checkbox"
                        value={year}
                        className="mr-2"
                        checked={checked}
                        onChange={this.handleChange}
                    />
                    {bucket.doc_count ? <span>{text}</span> : <del>{text}</del>}
                </label>
            </li>
        );
    };

    reset = () => this.props.onChange([]);

    render() {
        const { aggregation, title, selected } = this.props;

        const buckets = aggregation.buckets || [];

        return (
            <div className="mt-2">
                <div className="d-flex justify-content-between">
                    <div>
                        <small className="text-muted">{title}</small>
                    </div>
                    <div>
                        {!!selected.length && (
                            <button
                                className="btn btn-sm btn-secondary"
                                onClick={this.reset}>
                                Reset
                            </button>
                        )}
                    </div>
                </div>

                <ul className="list-unstyled">{buckets.map(this.renderBucket)}</ul>
            </div>
        );
    }
}
