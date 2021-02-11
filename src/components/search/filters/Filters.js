import React, { memo, useCallback } from 'react'
import { List } from '@material-ui/core'
import DateHistogramFilter from './DateHistogramFilter'
import TermsAggregationFilter from './TermsAggregationFilter'
import { aggregationFields } from '../../../constants/aggregationFields'
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
            {Object.entries(aggregationFields).map(([field, params]) => {
                let FilterComponent, filterTypeProps
                if (params.type === 'date') {
                    FilterComponent = DateHistogramFilter
                    filterTypeProps = {
                        onPagination: handlePagination
                    }
                } else {
                    FilterComponent = TermsAggregationFilter
                    filterTypeProps = {
                        onLoadMore: handleLoadMore
                    }
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
                        queryFacets={query.facets?.[field]}
                        aggregations={aggregations[field]}
                        {...filterTypeProps}
                        {...filterProps}
                    />
                )
            })}
        </List>
    )
}

export default memo(Filters)
