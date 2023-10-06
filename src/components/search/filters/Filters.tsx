import { CircularProgress, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC, ReactElement } from 'react'
import { Entries } from 'type-fest'

import { getLanguageName } from '../../../utils/utils'
import { useSharedStore } from '../../SharedStoreProvider'

import { CategoryDrawer } from './CategoryDrawer/CategoryDrawer'
import { CategoryDrawerToolbar } from './CategoryDrawerToolbar/CategoryDrawerToolbar'
import { DateHistogramFilter } from './DateHistogramFilter'
import { useStyles } from './Filters.styles'
import { TermsAggregationFilter } from './TermsAggregationFilter'

import type { Bucket } from '../../../Types'

export const Filters: FC = observer(() => {
    const { classes } = useStyles()
    const {
        searchStore: {
            query,
            searchViewStore: { categoryQuickFilter },
            filtersStore: { categories, expandedFilters, onExpandToggle, isHighlighted },
            searchAggregationsStore: { aggregations, aggregationsLoading, aggregationsLoadingETA },
        },
    } = useSharedStore()

    return (
        <>
            {(Object.entries(categories) as Entries<typeof categories>).map(([category, { label, icon, filters }]) => {
                const greyed = filters.every(({ field }) => aggregations?.[field]?.values?.buckets?.length === 0)
                const loading = filters.some(({ field }) => aggregationsLoading[field])
                const loadingETA = Math.min(...filters.map(({ field }) => aggregationsLoadingETA[field] || Number.MAX_SAFE_INTEGER))

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
                        toolbar={<CategoryDrawerToolbar category={category} />}
                    >
                        {filters.map(({ field, type, buckets, filterLabel }) => {
                            let FilterComponent,
                                filterTypeProps: { bucketLabel?: (bucket: Bucket) => ReactElement | string } = {}

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
                                    loading={!!aggregationsLoading[field]}
                                    loadingETA={loadingETA}
                                    open={expandedFilters[category] === field}
                                    onToggle={filters.length > 1 && expandedFilters[category] !== field ? onExpandToggle(category, field) : undefined}
                                    quickFilter={categoryQuickFilter[category]}
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
