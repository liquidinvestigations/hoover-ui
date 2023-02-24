import { CircularProgress, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { Entries } from 'type-fest'

import { AsyncQueryTask } from '../../../stores/search/AsyncTaskRunner'
import { getLanguageName } from '../../../utils/utils'
import { useSharedStore } from '../../SharedStoreProvider'

import { CategoryDrawer } from './CategoryDrawer/CategoryDrawer'
import { CategoryDrawerToolbar } from './CategoryDrawerToolbar/CategoryDrawerToolbar'
import DateHistogramFilter from './DateHistogramFilter'
import { useStyles } from './Filters.styles'
import TermsAggregationFilter from './TermsAggregationFilter'

import type { Bucket } from '../../../Types'

export const Filters: FC = observer(() => {
    const classes = useStyles()
    const {
        searchStore: {
            query,
            filtersStore: { categories, expandedFilters, onExpandToggle, handleChange, isHighlighted },
            searchViewStore: { categoryQuickFilter },
            searchAggregationsStore: { aggregationsQueryTasks, aggregationsLoading, error, missingAggregationsQueryTasks },
        },
    } = useSharedStore()

    if (error) {
        return (
            <Typography color="error" className={classes.error}>
                {error}
            </Typography>
        )
    }

    return (
        <>
            {(Object.entries(categories) as Entries<typeof categories>).map(([category, { label, icon, filters }]) => {
                const greyed = filters.every(({ field }) => {
                    return Object.entries(aggregationsQueryTasks).every(
                        ([_collection, task]) => task.data?.result?.aggregations?.[field]?.values?.buckets?.length === 0
                    )
                })

                const loading = filters.some(({ field }) => aggregationsLoading?.[1].data?.result?.aggregations[field])

                const loadingTask = Object.entries(aggregationsQueryTasks).find(
                    ([_collection, task]) => task.data?.result && Object.keys(task.data?.result?.aggregations).includes(filters[0].field)
                )
                let loadingETA = Number.MAX_SAFE_INTEGER
                if (loadingTask) {
                    const task = Object.entries(loadingTask)[0][1] as AsyncQueryTask
                    if (task.data?.status === 'done') {
                        loadingETA = 0
                    } else {
                        loadingETA = Math.min(task?.initialEta || 0, task.data?.eta.total_sec || 0)
                    }
                }

                return (
                    <CategoryDrawer
                        key={category}
                        title={
                            <>
                                {label}
                                {loading && <CircularProgress size={16} thickness={4} className={classes.loading} />}
                            </>
                        }
                        icon={icon}
                        greyed={greyed}
                        highlight={isHighlighted(filters)}
                        category={category}
                        loading={loading}
                        loadingETA={loadingETA}
                        toolbar={<CategoryDrawerToolbar category={category} />}>
                        {filters.map(({ field, type, buckets, filterLabel }) => {
                            let FilterComponent,
                                filterTypeProps: { bucketLabel?: (bucket: Bucket) => string } = {}

                            if (type === 'date') {
                                FilterComponent = DateHistogramFilter
                            } else {
                                FilterComponent = TermsAggregationFilter
                            }

                            if (field === 'lang') {
                                filterTypeProps.bucketLabel = (bucket) => getLanguageName(bucket.key)
                            }

                            if (buckets) {
                                filterTypeProps.bucketLabel = (key) => {
                                    const bucket = buckets.find((bucketE) => bucketE.key === key.key)
                                    return bucket ? bucket.label || bucket.key : key.key
                                }
                            }

                            return (
                                <FilterComponent
                                    key={field}
                                    title={filterLabel}
                                    field={field}
                                    queryFilter={query?.filters?.[field]}
                                    queryFacets={query?.facets?.[field]}
                                    aggregations={aggregationsQueryTasks?.[1].data?.result?.aggregations[field]}
                                    loading={aggregationsLoading?.[1].data?.result?.aggregations[field]}
                                    loadingETA={loadingETA}
                                    missing={missingAggregationsQueryTasks?.[1].data?.result?.aggregations[`${field}-missing`]}
                                    open={expandedFilters[category] === field}
                                    onToggle={filters.length > 1 && expandedFilters[category] !== field ? onExpandToggle(category, field) : null}
                                    onChange={handleChange}
                                    search={categoryQuickFilter[category]}
                                    {...filterTypeProps}
                                />
                            )
                        })}
                    </CategoryDrawer>
                )
            })}
        </>
    )
})
