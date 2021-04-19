import React, { memo, useCallback, useMemo } from 'react'
import Loading from '../../Loading'
import DateHistogramFilter from './DateHistogramFilter'
import TermsAggregationFilter from './TermsAggregationFilter'
import { useSearch } from '../SearchProvider'
import { getLanguageName } from '../../../utils'
import { aggregationFields } from '../../../constants/aggregationFields'
import { Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import CategoryDrawer from './CategoryDrawer'

const useStyles = makeStyles(theme => ({
    error: {
        padding: theme.spacing(2),
    },
}))

const formatLang = bucket => getLanguageName(bucket.key)

function Filters({ drawerOpenCategory, onDrawerOpen }) {
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

    const filtersCategories = useMemo(() => Object.entries(aggregationFields).reduce((acc, [field, params]) => {
        const { category, categoryLabel, categoryIcon, ...filterParams } = params

        if (!acc[category]) {
            acc[category] = {
                label: categoryLabel,
                icon: categoryIcon,
                filters: [],
            }
        }
        acc[category].filters.push({ field, ...filterParams })
        return acc

    }, {}), [aggregationFields])

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

    return Object.entries(filtersCategories).map(([category, { label, icon, filters }]) => {
        const highlight = filters.some(filter => {
            const queryFilter = query.filters?.[filter.field]

            return !!queryFilter?.include?.length || !!queryFilter?.exclude?.length || !!queryFilter?.missing
                || !!(queryFilter?.from || queryFilter?.to || queryFilter?.intervals)
        })

        return (
            <CategoryDrawer
                key={category}
                title={label}
                icon={icon}
                highlight={highlight}
                open={drawerOpenCategory === category}
                onToggle={open => onDrawerOpen(open ? category : null)}
            >
                {filters.map(({ field, type, hideEmpty, buckets, filterLabel }) => {

                    let FilterComponent, filterTypeProps = {}
                    if (type === 'date') {
                        FilterComponent = DateHistogramFilter
                    } else {
                        FilterComponent = TermsAggregationFilter
                    }

                    if (hideEmpty) {
                        //filterTypeProps.emptyDisabled = true
                    }

                    if (field === 'lang') {
                        filterTypeProps.bucketLabel = formatLang
                    }

                    if (buckets) {
                        filterTypeProps.bucketLabel = key => {
                            const bucket = buckets.find(bucket => bucket.key === key.key)
                            return bucket ? bucket.label || bucket.key : key.key
                        }
                    }

                    return (
                        <FilterComponent
                            key={field}
                            title={filterLabel}
                            field={field}
                            queryFilter={query.filters?.[field]}
                            aggregations={aggregations[field]}
                            missing={aggregations[`${field}-missing`]}
                            {...filterTypeProps}
                            {...filterProps}
                        />
                    )
                })}
            </CategoryDrawer>
        )
    })
}

export default memo(Filters)
