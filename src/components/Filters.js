import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DateTime } from 'luxon';

import { updateSearchQuery } from '../actions';

import Filter from './Filter';
import AggregationFilter from './AggregationFilter';
import DateRangeFilter from './DateRangeFilter';

import langs from 'langs';

const formatYear = bucket => DateTime.fromISO(bucket.key_as_string).year.toString();
const formatLang = bucket => langs.where('1', bucket.key).name;
const timeBucketSorter = (a, b) => b.key - a.key;

class Filters extends Component {
    static propTypes = {
        query: PropTypes.object.isRequired,
        aggregations: PropTypes.object,
    };

    filter = key => value =>
        this.props.dispatch(updateSearchQuery({ [key]: value }));

    render() {
        const { query, aggregations } = this.props;

        if (!aggregations) {
            return null;
        }

        return (
            <div>
                <div>
                    <Filter title="File type" defaultOpen={query.fileType.length}>
                        <AggregationFilter
                            title=""
                            selected={query.fileType}
                            aggregation={aggregations.count_by_filetype}
                            onChange={this.filter('fileType')}
                        />
                    </Filter>
                </div>

                <div>
                    <Filter
                        title="Date range"
                        defaultOpen={query.dateFrom || query.dateTo}>
                        <DateRangeFilter
                            onChange={this.filter('dateRange')}
                            defaultFrom={query.dateFrom}
                            defaultTo={query.dateTo}
                        />
                    </Filter>
                </div>

                <div>
                    <Filter
                        title="Years"
                        defaultOpen={
                            query.dateYears.length || query.dateCreatedYears.length
                        }>
                        <AggregationFilter
                            aggregation={aggregations.count_by_date_year}
                            selected={query.dateYears}
                            title="Year"
                            onChange={this.filter('dateYears')}
                            sortBuckets={timeBucketSorter}
                            bucketLabel={formatYear}
                            bucketValue={formatYear}
                        />

                        <AggregationFilter
                            aggregation={aggregations.count_by_date_created_year}
                            selected={query.dateCreatedYears}
                            title="Year created"
                            onChange={this.filter('dateCreatedYears')}
                            sortBuckets={timeBucketSorter}
                            bucketLabel={formatYear}
                            bucketValue={formatYear}
                        />
                    </Filter>
                </div>

                <div>
                    <Filter title="Language" defaultOpen={query.language.length}>
                        <AggregationFilter
                            aggregation={aggregations.count_by_lang}
                            selected={query.language}
                            onChange={this.filter('language')}
                            bucketLabel={formatLang}
                        />
                    </Filter>
                </div>
            </div>
        );
    }
}

const mapStateToProps = ({
    search: {
        query,
        results: { aggregations },
    },
}) => ({ query, aggregations });

export default connect(mapStateToProps)(Filters);
