import React, { memo, useCallback } from 'react'
import { List } from '@material-ui/core'
import DateHistogramFilter from './DateHistogramFilter'
import TermsAggregationFilter from './TermsAggregationFilter'
import { getLanguageName } from '../../../utils'

const formatLang = bucket => getLanguageName(bucket.key)

function Filters({ loading, query, aggregations, applyFilter, ...rest }) {
    const handleChange = useCallback((key, value, resetPage) => {
        if (resetPage) {
            const { [key]: prevFacet, ...rest } = query.facets || {}
            applyFilter({ [key]: value, facets: { ...rest } })
        } else {
            applyFilter({ [key]: value })
        }
    }, [query])

    const handlePagination = useCallback((key, newPage) => {
        const { [key]: prevFacet, ...rest } = query.facets || {}
        if (newPage > 1) {
            applyFilter({ facets: { [key]: newPage, ...rest } })
        } else {
            applyFilter({ facets: { ...rest } })
        }
    }, [query])

    const handleLoadMore = useCallback((key, page) => {
        const facets = query.facets || {}
        applyFilter({ facets: { ...facets, [key]: page } })
    }, [query])

    const filterProps = {
        disabled: loading,
        onChange: handleChange,
    }

    if (!aggregations) {
        return null
    }

    return (
        <List {...rest}>
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
