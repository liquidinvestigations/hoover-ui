import React, { memo, useCallback } from 'react'
import Loading from '../../Loading'
import DateHistogramFilter from './DateHistogramFilter'
import TermsAggregationFilter from './TermsAggregationFilter'
import { useSearch } from '../SearchProvider'
import { getLanguageName } from '../../../utils'
import { aggregationFields } from '../../../constants/aggregationFields'

const formatLang = bucket => getLanguageName(bucket.key)

function Filters() {
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

    const filterProps = {
        loading: aggregationsLoading || resultsLoading,
        onChange: handleChange,
    }

    if (!aggregations && aggregationsLoading) {
        return <Loading />
    }

    if (!aggregations) {
        return null
    }

    return Object.entries(aggregationFields).map(([field, params]) => {
            let FilterComponent, filterTypeProps = {}
            if (params.type === 'date') {
                FilterComponent = DateHistogramFilter
            } else {
                FilterComponent = TermsAggregationFilter
            }

            if (params.hideEmpty) {
                //filterTypeProps.emptyDisabled = true
            }

            if (field === 'lang') {
                filterTypeProps.bucketLabel = formatLang
            }

        return (
            <FilterComponent
                key={field}
                title={params.filterLabel}
                field={field}
                queryFilter={query.filters?.[field]}
                aggregations={aggregations[field]}
                missing={aggregations[`${field}-missing`]}
                {...filterTypeProps}
                {...filterProps}
            />
        )
    })
}

export default memo(Filters)
