import React, { memo, useCallback, useContext } from 'react'
import { List } from '@material-ui/core'
import DateHistogramFilter from './DateHistogramFilter'
import TermsAggregationFilter from './TermsAggregationFilter'
import { getLanguageName } from '../../../utils'
import { UserContext } from '../../../../pages/_app'

const formatLang = bucket => getLanguageName(bucket.key)

function Filters({ loading, query, aggregations, applyFilter, ...rest }) {
    const whoAmI = useContext(UserContext)

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
                queryField={query.tags}
                queryFacets={query.facets?.tags}
                aggregations={aggregations.tags}
                onLoadMore={handleLoadMore}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Private tags"
                field={`priv-tags.${whoAmI.username}`}
                queryField={query[`priv-tags.${whoAmI.username}`]}
                queryFacets={query.facets?.[`priv-tags.${whoAmI.username}`]}
                aggregations={aggregations[`priv-tags.${whoAmI.username}`]}
                onLoadMore={handleLoadMore}
                {...filterProps}
            />

            <DateHistogramFilter
                title="Date modified"
                field="date"
                queryField={query.date}
                queryFacets={query.facets?.date}
                aggregations={aggregations.date}
                onPagination={handlePagination}
                {...filterProps}
            />

            <DateHistogramFilter
                title="Date created"
                field="date-created"
                queryField={query['date-created']}
                queryFacets={query.facets?.['date-created']}
                aggregations={aggregations['date-created']}
                onPagination={handlePagination}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="File type"
                field="filetype"
                queryField={query.filetype}
                queryFacets={query.facets?.filetype}
                aggregations={aggregations.filetype}
                onLoadMore={handleLoadMore}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Language"
                field="lang"
                queryField={query.lang}
                queryFacets={query.facets?.lang}
                aggregations={aggregations.lang}
                onLoadMore={handleLoadMore}
                bucketLabel={formatLang}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Email domain"
                field="email-domains"
                queryField={query['email-domains']}
                queryFacets={query.facets?.['email-domains']}
                aggregations={aggregations['email-domains']}
                onLoadMore={handleLoadMore}
                emptyDisabled
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Email from"
                field="from.keyword"
                queryField={query['from.keyword']}
                queryFacets={query.facets?.['from.keyword']}
                aggregations={aggregations['from.keyword']}
                onLoadMore={handleLoadMore}
                emptyDisabled
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Email to"
                field="to.keyword"
                queryField={query['to.keyword']}
                queryFacets={query.facets?.['to.keyword']}
                aggregations={aggregations['to.keyword']}
                onLoadMore={handleLoadMore}
                emptyDisabled
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Path"
                field="path-parts"
                queryField={query['path-parts']}
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
