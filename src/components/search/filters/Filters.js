import React, { memo, useCallback } from 'react'
import Loading from '../../Loading'
import DateHistogramFilter from './DateHistogramFilter'
import TermsAggregationFilter from './TermsAggregationFilter'
import { useSearch } from '../SearchProvider'
import { getLanguageName } from '../../../utils'
import { aggregationFields } from '../../../constants/aggregationFields'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    error: {
        padding: theme.spacing(2),
    },
}))

const formatLang = bucket => getLanguageName(bucket.key)

function Filters() {
    const classes = useStyles()
    const { query, search, aggregations, aggregationsError, resultsLoading, aggregationsLoading } = useSearch()

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

    if (aggregationsError) {
        return <Typography color="error" className={classes.error}>{aggregationsError}</Typography>
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

            if (params.buckets) {
                filterTypeProps.bucketLabel = key => {
                    const bucket = params.buckets.find(bucket => bucket.key === key.key)
                    return bucket ? bucket.label || bucket.key : key.key
                }
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
