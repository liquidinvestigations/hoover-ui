import { CircularProgress, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { Entries } from 'type-fest'

import { getLanguageName } from '../../../utils/utils'
import { useSharedStore } from '../../SharedStoreProvider'
import { useSearch } from '../SearchProvider'

import { CategoryDrawer } from './CategoryDrawer/CategoryDrawer'
import { CategoryDrawerToolbar } from './CategoryDrawerToolbar/CategoryDrawerToolbar'
import DateHistogramFilter from './DateHistogramFilter'
import { useStyles } from './Filters.styles'
import TermsAggregationFilter from './TermsAggregationFilter'

export const Filters: FC = observer(() => {
    const classes = useStyles()
    const {
        searchStore: {
            query,
            filtersStore: { categories, expandedFilters, onExpandToggle, handleChange, isHighlighted },
            searchViewStore: { categoryQuickFilter },
        },
    } = useSharedStore()

    const { aggregations, aggregationsTasks, aggregationsLoading, aggregationsError, missingAggregations } = useSearch()

    if (aggregationsError) {
        return (
            <Typography color="error" className={classes.error}>
                {aggregationsError}
            </Typography>
        )
    }

    return (
        <>
            {(Object.entries(categories) as Entries<typeof categories>).map(([category, { label, icon, filters }]) => {
                const greyed = filters.every(({ field }) => {
                    return aggregations?.[field]?.values?.buckets?.length === 0
                })

                const loading = filters.some(({ field }) => aggregationsLoading[field])

                const loadingTask = Object.entries(aggregationsTasks).find(([fields]) => fields.split(',').includes(filters[0].field))
                let loadingETA = Number.MAX_SAFE_INTEGER
                if (loadingTask) {
                    const taskData = loadingTask[1]
                    if (taskData.status === 'done') {
                        loadingETA = 0
                    } else {
                        loadingETA = Math.min(taskData.initialEta, taskData.eta.total_sec)
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
                                filterTypeProps = {}

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
                                    aggregations={aggregations?.[field]}
                                    loading={aggregationsLoading[field]}
                                    loadingETA={loadingETA}
                                    missing={missingAggregations?.[`${field}-missing`]}
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
