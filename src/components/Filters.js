import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DateTime } from 'luxon';

import ListItem from '@material-ui/core/ListItem';

import Filter from './Filter';
import AggregationFilter from './AggregationFilter';
import DateRangeFilter from './DateRangeFilter';

const formatYear = bucket => DateTime.fromISO(bucket.key_as_string).year.toString();

class Filters extends Component {
    static propTypes = {
        query: PropTypes.object.isRequired,
        aggregations: PropTypes.object,
    };

    render() {
        const { query, aggregations } = this.props;

        if (!aggregations) {
            return null;
        }

        return (
            <div className="filters">
                <ListItem>
                    <Filter title="File type" defaultOpen={query.fileType.length}>
                        <AggregationFilter
                            title=""
                            selected={query.fileType}
                            aggregation={aggregations.count_by_filetype}
                            onChange={this.handleFileTypeFilter}
                        />
                    </Filter>
                </ListItem>

                <ListItem>
                    <Filter
                        title="Date range"
                        defaultOpen={query.dateFrom || query.dateTo}>
                        <DateRangeFilter
                            onChange={this.handleDateRangeFilter}
                            defaultFrom={query.dateFrom}
                            defaultTo={query.dateTo}
                        />
                    </Filter>
                </ListItem>

                <ListItem>
                    <Filter
                        title="Years"
                        defaultOpen={
                            query.dateYears.length || query.dateCreatedYears.length
                        }>
                        <AggregationFilter
                            aggregation={aggregations.count_by_date_year}
                            selected={query.dateYears}
                            title="Year"
                            onChange={this.handleDateFilter}
                            bucketLabel={formatYear}
                        />

                        <AggregationFilter
                            aggregation={aggregations.count_by_date_created_year}
                            selected={query.dateCreatedYears}
                            title="Year created"
                            onChange={this.handleDateCreatedFilter}
                            bucketLabel={formatYear}
                        />
                    </Filter>
                </ListItem>
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
