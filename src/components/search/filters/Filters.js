import React, { memo, useCallback, useMemo, useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Typography } from '@material-ui/core'
import TermsAggregationFilter from './TermsAggregationFilter'
import DateHistogramFilter from './DateHistogramFilter'
import CategoryDrawer from './CategoryDrawer'
import { useSearch } from '../SearchProvider'
import { getLanguageName } from '../../../utils'
import { aggregationCategories, aggregationFields } from '../../../constants/aggregationFields'
import CategoryDrawerToolbar from './CategoryDrawerToolbar'

const useStyles = makeStyles(theme => ({
    error: {
        padding: theme.spacing(2),
    },
    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },
}))

const formatLang = bucket => getLanguageName(bucket.key)

function Filters({ wideFilters, drawerWidth, drawerPinned, setDrawerPinned, drawerPortalRef, openCategory, setOpenCategory }) {
    const classes = useStyles()
    const { query, search, aggregations, aggregationsTasks, aggregationsLoading,
        aggregationsError, missingAggregations } = useSearch()

    const categories = useMemo(() => Object.entries(aggregationCategories)
        .reduce((acc, [category, { label, icon, filters }]) => {
            acc[category] = {
                label,
                icon,
                filters: filters.map(field => ({ field, ...aggregationFields[field] })),
            }
            return acc
        }, {}), [aggregationCategories, aggregationFields])

    const [expandedFilters, setExpandedFilters] = useState(
        Object.entries(categories).reduce((acc, [category, { filters }]) => {
            if (!acc[category]) {
                filters.some(({ field }) => {
                    const queryFilter = query.filters?.[field]
                    if (!!queryFilter?.include?.length || !!queryFilter?.exclude?.length || !!queryFilter?.missing ||
                        !!(queryFilter?.from || queryFilter?.to || queryFilter?.intervals)) {
                        acc[category] = field
                        return true
                    }
                })
            }

            if (!acc[category]) {
                filters.some(({ field }) => {
                    if (!!aggregations?.[field]?.values.buckets.length) {
                        acc[category] = field
                        return true
                    }
                })
            }

            if (!acc[category]) {
                acc[category] = filters[0].field
            }

            return acc
        }, {})
    )

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

    const [searchBuckets, setSearchBuckets] = useState(
        Object.fromEntries(Object.entries(categories).map(([category]) => [category, '']))
    )
    const handleBucketsSearch = category => value => {
        setSearchBuckets(categories => ({...categories, [category]: value}))
    }

    if (aggregationsError) {
        return <Typography color="error" className={classes.error}>{aggregationsError}</Typography>
    }

    return Object.entries(categories).map(([category, { label, icon, filters }]) => {
        const highlight = filters.some(filter => {
            const queryFilter = query.filters?.[filter.field]

            return !!queryFilter?.include?.length || !!queryFilter?.exclude?.length || !!queryFilter?.missing
                || !!(queryFilter?.from || queryFilter?.to || queryFilter?.intervals)
        })

        const greyed = filters.every(({ field }) => {
            return aggregations?.[field]?.values?.buckets?.length === 0
        })

        const loading = filters.some(({ field }) => aggregationsLoading[field])

        const loadingTask = Object.entries(aggregationsTasks).find(([fields]) => fields.split(',').includes(filters[0].field))
        let loadingProgress = 5
        if (loadingTask) {
            const taskData = loadingTask[1]
            if (taskData.status === 'done') {
                loadingProgress = 100
            } else if (taskData.eta.total_sec / taskData.initialEta < 1) {
                loadingProgress = Math.max(5, taskData.eta.total_sec / taskData.initialEta * 100)
            }
        }

        return (
            <CategoryDrawer
                key={category}
                title={label}
                icon={icon}
                greyed={greyed}
                highlight={highlight}
                category={category}
                loading={loading}
                loadingProgress={loadingProgress}
                open={openCategory === category}
                onOpen={setOpenCategory}
                wideFilters={wideFilters}
                width={drawerWidth}
                pinned={drawerPinned}
                portalRef={drawerPortalRef}
                toolbar={(
                    <CategoryDrawerToolbar
                        search={searchBuckets[category]}
                        onSearch={handleBucketsSearch(category)}
                        drawerPinned={drawerPinned}
                        setDrawerPinned={setDrawerPinned}
                        setOpenCategory={setOpenCategory}
                    />
                )}
            >
                {filters.map(({ field, type, buckets, filterLabel }) => {

                    let FilterComponent, filterTypeProps = {}
                    if (type === 'date') {
                        FilterComponent = DateHistogramFilter
                    } else {
                        FilterComponent = TermsAggregationFilter
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

                    const onToggle = open => {
                        if (open) {
                            setExpandedFilters({ ...expandedFilters, ...{ [category]: field } })
                        } else {
                            const { [category]: closed, ...expanded } = expandedFilters
                            setExpandedFilters(expanded)
                        }
                    }

                    return (
                        <FilterComponent
                            key={field}
                            title={filterLabel}
                            field={field}
                            queryFilter={query.filters?.[field]}
                            queryFacets={query.facets?.[field]}
                            aggregations={aggregations?.[field]}
                            loading={aggregationsLoading[field]}
                            loadingProgress={loadingProgress}
                            missing={missingAggregations?.[`${field}-missing`]}
                            open={expandedFilters[category] === field}
                            onToggle={filters.length > 1 && expandedFilters[category] !== field ? onToggle : null}
                            onChange={handleChange}
                            search={searchBuckets[category]}
                            {...filterTypeProps}
                        />
                    )
                })}
            </CategoryDrawer>
        )
    })
}

export default memo(Filters)
