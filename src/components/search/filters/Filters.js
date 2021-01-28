import React, { memo, useCallback } from 'react'
import { List } from '@material-ui/core'
import DateHistogramFilter from './DateHistogramFilter'
import TermsAggregationFilter from './TermsAggregationFilter'
import { useSearch } from '../SearchProvider'
import { getLanguageName } from '../../../utils'

const formatLang = bucket => getLanguageName(bucket.key)

function Filters({ ...props }) {
    const { query, search, aggregations, resultsLoading, aggregationsLoading } = useSearch()

    const triggerSearch = params => {
        search({ ...params, page: 1 })
    }

    const handleChange = useCallback((key, value, resetPage) => {
        const { [key]: prevFilter, ...restFilters } = query.filters || {}
        if (resetPage) {
            const { [key]: prevFacet, ...restFacets } = query.facets || {}
            triggerSearch({ filters: { [key]: value, ...restFilters }, facets: { ...restFacets } })
        } else {
            triggerSearch({ filters: { [key]: value, ...restFilters } })
        }
    }, [query])

    const handlePagination = useCallback((key, newPage) => {
        const { [key]: prevFacet, ...restFacets } = query.facets || {}
        if (newPage > 1) {
            triggerSearch({ facets: { [key]: newPage, ...restFacets } })
        } else {
            triggerSearch({ facets: { ...restFacets } })
        }
    }, [query])

    const handleLoadMore = useCallback((key, page) => {
        const facets = query.facets || {}
        triggerSearch({ facets: { ...facets, [key]: page } })
    }, [query])

    const filterProps = {
        disabled: aggregationsLoading || resultsLoading,
        onChange: handleChange,
    }

    if (!aggregations) {
        return null
    }

    return (
        <List {...props}>
            <TermsAggregationFilter
                title="Public tags"
                field="tags"
                queryFilter={query.filters?.tags}
                queryFacets={query.facets?.tags}
                aggregations={aggregations.tags}
                onLoadMore={handleLoadMore}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Private tags"
                field="priv-tags"
                queryFilter={query.filters?.['priv-tags']}
                queryFacets={query.facets?.['priv-tags']}
                aggregations={aggregations['priv-tags']}
                onLoadMore={handleLoadMore}
                {...filterProps}
            />

            <DateHistogramFilter
                title="Date modified"
                field="date"
                queryFilter={query.filters?.date}
                queryFacets={query.facets?.date}
                aggregations={aggregations.date}
                onPagination={handlePagination}
                {...filterProps}
            />

            <DateHistogramFilter
                title="Date created"
                field="date-created"
                queryFilter={query.filters?.['date-created']}
                queryFacets={query.facets?.['date-created']}
                aggregations={aggregations['date-created']}
                onPagination={handlePagination}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="File type"
                field="filetype"
                queryFilter={query.filters?.filetype}
                queryFacets={query.facets?.filetype}
                aggregations={aggregations.filetype}
                onLoadMore={handleLoadMore}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Language"
                field="lang"
                queryFilter={query.filters?.lang}
                queryFacets={query.facets?.lang}
                aggregations={aggregations.lang}
                onLoadMore={handleLoadMore}
                bucketLabel={formatLang}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Email domain"
                field="email-domains"
                queryFilter={query.filters?.['email-domains']}
                queryFacets={query.facets?.['email-domains']}
                aggregations={aggregations['email-domains']}
                onLoadMore={handleLoadMore}
                emptyDisabled
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Email from"
                field="from.keyword"
                queryFilter={query.filters?.['from.keyword']}
                queryFacets={query.facets?.['from.keyword']}
                aggregations={aggregations['from.keyword']}
                onLoadMore={handleLoadMore}
                emptyDisabled
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Email to"
                field="to.keyword"
                queryFilter={query.filters?.['to.keyword']}
                queryFacets={query.facets?.['to.keyword']}
                aggregations={aggregations['to.keyword']}
                onLoadMore={handleLoadMore}
                emptyDisabled
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Path"
                field="path-parts"
                queryFilter={query.filters?.['path-parts']}
                queryFacets={query.facets?.['path-parts']}
                aggregations={aggregations['path-parts']}
                onLoadMore={handleLoadMore}
                emptyDisabled
                {...filterProps}
            />
        </List>
    )
}

export default memo(Filters)
