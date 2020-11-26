import React, { memo } from 'react'
import { DateTime } from 'luxon'
import { List } from '@material-ui/core'
import Filter from './Filter'
import AggregationFilter from './AggregationFilter'
import DateRangeFilter from './DateRangeFilter'
import { DEFAULT_FACET_SIZE } from '../../constants'
import { getLanguageName } from '../../utils'

const formatYear = bucket => DateTime.fromISO(bucket.key_as_string).year.toString()
const formatLang = bucket => getLanguageName(bucket.key)
const timeBucketSorter = (a, b) => b.key - a.key

function Filters({ loading, query, aggregations, applyFilter }) {
    if (!aggregations) {
        return null
    }

    const handleFilterChange = key => value => applyFilter({ [key]: value })

    const handleLoadMore = key => {
        const facets = query.facets = {}
        const newValue = (facets[key] || DEFAULT_FACET_SIZE) + DEFAULT_FACET_SIZE
        //applyFilter({ facets: { ...facets, [key]: newValue } })
    }

    return (
        <List>
            <Filter
                title="Date range"
                defaultOpen={!!(query.dateRange?.from || query.dateRange?.to)}>
                <DateRangeFilter
                    disabled={loading}
                    onChange={handleFilterChange('dateRange')}
                    defaultFrom={query.dateRange?.from}
                    defaultTo={query.dateRange?.to}
                />
            </Filter>

            <Filter title="File type" defaultOpen={!!query.fileType?.length}>
                <AggregationFilter
                    disabled={loading}
                    title=""
                    selected={query.fileType}
                    aggregation={aggregations.count_by_filetype.filetype}
                    cardinality={aggregations.count_by_filetype.filetype_count}
                    size={query.facets?.fileType || DEFAULT_FACET_SIZE}
                    onChange={handleFilterChange('fileType')}
                    onLoadMore={handleLoadMore('fileType')}
                />
            </Filter>

            <Filter title="Language" defaultOpen={!!query.language?.length}>
                <AggregationFilter
                    disabled={loading}
                    aggregation={aggregations.count_by_lang.lang}
                    cardinality={aggregations.count_by_lang.lang_count}
                    selected={query.language}
                    bucketLabel={formatLang}
                    onChange={handleFilterChange('language')}
                    size={query.facets?.language || DEFAULT_FACET_SIZE}
                    onLoadMore={handleLoadMore('language')}
                />
            </Filter>

            <Filter
                title="Email domain"
                defaultOpen={!!query.emailDomains?.length}>
                <AggregationFilter
                    disabled={loading}
                    aggregation={
                        aggregations.count_by_email_domains.email_domains
                    }
                    cardinality={
                        aggregations.count_by_email_domains.email_domains_count
                    }
                    selected={query.emailDomains}
                    onChange={handleFilterChange('emailDomains')}
                    size={query.facets?.emailDomains || DEFAULT_FACET_SIZE}
                    onLoadMore={handleLoadMore('emailDomains')}
                />
            </Filter>

            <Filter
                enabled={false}
                title="Years"
                defaultOpen={
                    !!(query.dateYears?.length || query.dateCreatedYears?.length)
                }>
                <AggregationFilter
                    disabled={loading}
                    aggregation={aggregations.count_by_date_years.date_years}
                    selected={query.dateYears}
                    title="Year"
                    onChange={handleFilterChange('dateYears')}
                    sortBuckets={timeBucketSorter}
                    bucketLabel={formatYear}
                    bucketValue={formatYear}
                />

                <AggregationFilter
                    disabled={loading}
                    aggregation={
                        aggregations
                            .count_by_date_created_years
                            .date_created_years
                    }
                    cardinality={
                        aggregations.
                            count_by_date_created_years
                            .date_created_years_count
                    }
                    selected={query.dateCreatedYears}
                    title="Year created"
                    onChange={handleFilterChange('dateCreatedYears')}
                    sortBuckets={timeBucketSorter}
                    bucketLabel={formatYear}
                    bucketValue={formatYear}
                />
            </Filter>
        </List>
    )
}

export default memo(Filters)
