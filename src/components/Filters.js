import { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { DateTime } from 'luxon';

import { updateSearchQuery, expandFacet } from '../actions';

import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';

import Filter from './Filter';
import AggregationFilter from './AggregationFilter';
import DateRangeFilter from './DateRangeFilter';

import { DEFAULT_FACET_SIZE } from '../constants';

import langs from 'langs';

const formatYear = bucket => DateTime.fromISO(bucket.key_as_string).year.toString();
const formatLang = bucket => langs.where('1', bucket.key).name;
const timeBucketSorter = (a, b) => b.key - a.key;

class Filters extends Component {
    static propTypes = {
        query: PropTypes.object.isRequired,
        isFetching: PropTypes.bool.isRequired,
        aggregations: PropTypes.object,
    };

    filter = key => value =>
        this.props.dispatch(updateSearchQuery({ [key]: value }));

    loadMore = key => () => this.props.dispatch(expandFacet(key));

    render() {
        const { query, aggregations, isFetching } = this.props;

        if (!aggregations) {
            return null;
        }

        return (
            <List>
                <Filter title="File type" defaultOpen={!!query.fileType.length}>
                    <AggregationFilter
                        disabled={isFetching}
                        title=""
                        selected={query.fileType}
                        aggregation={aggregations.count_by_filetype.filetype}
                        cardinality={aggregations.count_by_filetype.filetype_count}
                        size={query.facets.fileType || DEFAULT_FACET_SIZE}
                        onChange={this.filter('fileType')}
                        onLoadMore={this.loadMore('fileType')}
                    />
                </Filter>

                <Filter title="Language" defaultOpen={!!query.language.length}>
                    <AggregationFilter
                        disabled={isFetching}
                        aggregation={aggregations.count_by_lang.lang}
                        cardinality={aggregations.count_by_lang.lang_count}
                        selected={query.language}
                        bucketLabel={formatLang}
                        onChange={this.filter('language')}
                        size={query.facets.language || DEFAULT_FACET_SIZE}
                        onLoadMore={this.loadMore('language')}
                    />
                </Filter>

                <Filter
                    title="Email domain"
                    defaultOpen={!!query.emailDomains.length}>
                    <AggregationFilter
                        disabled={isFetching}
                        aggregation={
                            aggregations.count_by_email_domains.email_domains
                        }
                        cardinality={
                            aggregations.count_by_email_domains.email_domains_count
                        }
                        selected={query.emailDomains}
                        onChange={this.filter('emailDomains')}
                        size={query.facets.emailDomains || DEFAULT_FACET_SIZE}
                        onLoadMore={this.loadMore('emailDomains')}
                    />
                </Filter>

                <Filter
                    title="Date range"
                    defaultOpen={!!(query.dateRange.from || query.dateRange.to)}>
                    <DateRangeFilter
                        disabled={isFetching}
                        onChange={this.filter('dateRange')}
                        defaultFrom={query.dateRange.from}
                        defaultTo={query.dateRange.to}
                    />
                </Filter>

                <Filter
                    title="Years"
                    defaultOpen={
                        !!(query.dateYears.length || query.dateCreatedYears.length)
                    }>
                    <AggregationFilter
                        disabled={isFetching}
                        aggregation={aggregations.count_by_date_years.date_years}
                        selected={query.dateYears}
                        title="Year"
                        onChange={this.filter('dateYears')}
                        sortBuckets={timeBucketSorter}
                        bucketLabel={formatYear}
                        bucketValue={formatYear}
                    />

                    <AggregationFilter
                        disabled={isFetching}
                        aggregation={
                            aggregations.count_by_date_created_years
                                .date_created_years
                        }
                        cardinality={
                            aggregations.count_by_date_created_years
                                .date_created_years_count
                        }
                        selected={query.dateCreatedYears}
                        title="Year created"
                        onChange={this.filter('dateCreatedYears')}
                        sortBuckets={timeBucketSorter}
                        bucketLabel={formatYear}
                        bucketValue={formatYear}
                    />
                </Filter>
            </List>
        );
    }
}

const mapStateToProps = ({
    search: {
        query,
        isFetching,
        results: { aggregations },
    },
}) => ({ query, aggregations, isFetching });

export default connect(mapStateToProps)(Filters);
