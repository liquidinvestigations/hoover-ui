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
        query,
        aggregations,
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
                onLoadMore={handleLoadMore}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Private tags"
                field={`priv-tags.${whoAmI.username}`}
                onLoadMore={handleLoadMore}
                {...filterProps}
            />

            <DateHistogramFilter
                title="Date modified"
                field="date"
                onPagination={handlePagination}
                {...filterProps}
            />

            <DateHistogramFilter
                title="Date created"
                field="date-created"
                onPagination={handlePagination}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="File type"
                field="filetype"
                onLoadMore={handleLoadMore}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Language"
                field="lang"
                onLoadMore={handleLoadMore}
                bucketLabel={formatLang}
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Email domain"
                field="email-domains"
                onLoadMore={handleLoadMore}
                emptyDisabled
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Email from"
                field="from.keyword"
                onLoadMore={handleLoadMore}
                emptyDisabled
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Email to"
                field="to.keyword"
                onLoadMore={handleLoadMore}
                emptyDisabled
                {...filterProps}
            />

            <TermsAggregationFilter
                title="Path"
                field="path-parts"
                onLoadMore={handleLoadMore}
                emptyDisabled
                {...filterProps}
            />
        </List>
    )
}

export default memo(Filters)
