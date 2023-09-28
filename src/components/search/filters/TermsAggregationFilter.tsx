import { Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { aggregationFields } from '../../../constants/aggregationFields'
import { formatThousands } from '../../../utils/utils'
import { Expandable } from '../../common/Expandable/Expandable'
import { useSharedStore } from '../../SharedStoreProvider'

import { AggregationFilter } from './AggregationFilter/AggregationFilter'

import type { Terms } from '../../../backend/buildSearchQuery'
import type { Aggregation, Bucket, SourceField } from '../../../Types'

interface TermsAggregationFilterProps {
    title: string
    field: SourceField
    queryFilter: Terms
    queryFacets: number
    aggregations?: Aggregation
    loading: boolean
    loadingETA: number
    open: boolean
    onToggle?: (open: boolean) => void
    quickFilter?: string
    bucketLabel?: (bucket: Bucket) => string
}

export const TermsAggregationFilter: FC<TermsAggregationFilterProps> = observer(
    ({ title, field, queryFilter, queryFacets, aggregations, loading, loadingETA, open, onToggle, quickFilter, ...rest }) => {
        const { handleAggregationChange } = useSharedStore().searchStore.filtersStore

        const highlight = !!(queryFilter?.include?.length || queryFilter?.exclude?.length || queryFilter?.missing)

        return (
            <Expandable
                title={title}
                loading={loading}
                loadingETA={loadingETA}
                highlight={highlight}
                greyed={!aggregations?.values?.buckets?.length}
                open={open}
                onToggle={onToggle}
                resizable={false}
                summary={
                    aggregations?.values?.buckets !== undefined
                        ? ((
                              <Typography variant="caption" display="block">
                                  {!aggregationFields[field]?.buckets &&
                                      !aggregationFields[field]?.bucketsMax &&
                                      aggregations?.count.value > aggregations?.values?.buckets.length &&
                                      '> '}
                                  {formatThousands(
                                      aggregationFields[field]?.bucketsMax
                                          ? aggregations?.values?.buckets.reduce((acc, { doc_count }) => Math.max(acc, doc_count), 0)
                                          : aggregations?.values?.buckets.reduce((acc, { doc_count }) => acc + doc_count, 0),
                                  )}{' '}
                                  hits
                                  {', '}
                                  {aggregations?.count.value} buckets
                              </Typography>
                          ) as unknown as string)
                        : undefined
                }
            >
                <AggregationFilter
                    field={field}
                    queryFilter={queryFilter}
                    queryFacets={queryFacets}
                    aggregations={aggregations?.values}
                    loading={loading}
                    onChange={handleAggregationChange}
                    quickFilter={quickFilter}
                    triState
                    {...rest}
                />
            </Expandable>
        )
    },
)
