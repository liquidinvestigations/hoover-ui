import React, { memo } from 'react'
import { List } from '@material-ui/core'
import Filter from './Filter'
import DateIntervalsFilter from './DateIntervalsFilter'
import AggregationFilter from './AggregationFilter'
import { DEFAULT_FACET_SIZE } from '../../constants'
import { getLanguageName } from '../../utils'

const formatLang = bucket => getLanguageName(bucket.key)

function Filters(props) {
    const { loading, query, aggregations, applyFilter, ...rest } = props

    if (!aggregations) {
        return null
    }

    const handleFilterChange = key => value => applyFilter({ [key]: value })

    const handleLoadMore = key => () => {
        const facets = query.facets || {}
        const oldValue = parseInt(facets[key])
        const newValue = (!isNaN(oldValue) ? oldValue : DEFAULT_FACET_SIZE) + DEFAULT_FACET_SIZE
        applyFilter({ facets: { ...facets, [key]: newValue } })
    }

    return (
        <List {...rest}>
            <DateIntervalsFilter
                title="Date modified"
                value={query.date}
                disabled={loading}
                aggregation={aggregations.date.values}
                onChange={handleFilterChange('date')}
            />

            <DateIntervalsFilter
                title="Date created"
                value={query['date-created']}
                disabled={loading}
                aggregation={aggregations['date-created'].values}
                onChange={handleFilterChange('date-created')}
            />

            <Filter
                title="File type"
                defaultOpen={!!query.filetype?.length}
            >
                <AggregationFilter
                    disabled={loading}
                    selected={query.filetype}
                    aggregation={aggregations.filetype.values}
                    cardinality={aggregations.filetype.count}
                    size={query.facets?.filetype || DEFAULT_FACET_SIZE}
                    onChange={handleFilterChange('filetype')}
                    onLoadMore={handleLoadMore('filetype')}
                />
            </Filter>

            <Filter
                title="Language"
                defaultOpen={!!query.lang?.length}
            >
                <AggregationFilter
                    disabled={loading}
                    selected={query.lang}
                    bucketLabel={formatLang}
                    aggregation={aggregations.lang.values}
                    cardinality={aggregations.lang.count}
                    onChange={handleFilterChange('lang')}
                    size={query.facets?.lang || DEFAULT_FACET_SIZE}
                    onLoadMore={handleLoadMore('lang')}
                />
            </Filter>

            <Filter
                title="Email domain"
                defaultOpen={!!query['email-domains']?.length}
                enabled={!!aggregations['email-domains'].count.value}
            >
                <AggregationFilter
                    disabled={loading}
                    selected={query['email-domains']}
                    aggregation={aggregations['email-domains'].values}
                    cardinality={aggregations['email-domains'].count}
                    onChange={handleFilterChange('email-domains')}
                    size={query.facets?.['email-domains'] || DEFAULT_FACET_SIZE}
                    onLoadMore={handleLoadMore('email-domains')}
                />
            </Filter>
        </List>
    )
}

export default memo(Filters)
