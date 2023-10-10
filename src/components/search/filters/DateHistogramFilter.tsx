import { ListItem, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import { DateTime } from 'luxon'
import { observer } from 'mobx-react-lite'
import { FC, ReactElement, useCallback } from 'react'

import { HistogramParams } from '../../../backend/buildSearchQuery'
import { DEFAULT_FACET_SIZE, DEFAULT_INTERVAL } from '../../../constants/general'
import { formatThousands } from '../../../utils/utils'
import { Expandable } from '../../common/Expandable/Expandable'
import { useSharedStore } from '../../SharedStoreProvider'

import { AggregationFilter } from './AggregationFilter/AggregationFilter'
import { DateRangeFilter } from './DateRangeFilter'
import { IntervalSelect } from './IntervalSelect'

import type { Aggregation, Bucket, SourceField } from '../../../Types'

export const formatsLabel: Record<string, string> = {
    year: 'y',
    month: 'MMMM y',
    week: "y, 'Week' W",
    day: 'd MMMM y',
    hour: 'd MMM y, h a',
}

export const formatsValue: Record<string, string> = {
    year: 'yyyy',
    month: 'yyyy-MM',
    week: 'yyyy-MM-dd',
    day: 'yyyy-MM-dd',
    hour: "yyyy-MM-dd'T'HH",
}

interface DateHistogramFilterProps {
    title: ReactElement | string
    field: SourceField
    queryFilter?: HistogramParams
    queryFacets?: number
    aggregations?: Aggregation
    loading: boolean
    loadingETA: number
    open: boolean
    onToggle?: (open: boolean) => void
    quickFilter?: string
    bucketLabel?: (bucket: Bucket) => ReactElement | string
    bucketSubLabel?: (bucket: Bucket) => ReactElement | string
}

export const DateHistogramFilter: FC<DateHistogramFilterProps> = observer(
    ({ title, field, queryFilter, queryFacets, aggregations, loading, loadingETA, open, onToggle, quickFilter }) => {
        const { handleDateRangeChange, handleDateSelectionChange } = useSharedStore().searchStore.filtersStore

        const interval = queryFilter?.interval || DEFAULT_INTERVAL

        const formatLabel = useCallback((bucket: Bucket) => DateTime.fromISO(bucket.key_as_string || '').toFormat(formatsLabel[interval]), [interval])

        const formatWeekStart = useCallback((bucket: Bucket) => DateTime.fromISO(bucket.key_as_string || '').toFormat("('starting' d MMMM)"), [])

        const formatValue = useCallback(
            (bucket: Bucket) => DateTime.fromISO(bucket.key_as_string || '', { setZone: true }).toFormat(formatsValue[interval]),
            [interval],
        )

        return (
            <Expandable
                title={title}
                loading={loading}
                loadingETA={loadingETA}
                highlight={!!(queryFilter?.from || queryFilter?.to || queryFilter?.intervals)}
                greyed={!aggregations?.values?.buckets?.length}
                open={open}
                onToggle={onToggle}
                resizable={false}
                summary={
                    aggregations?.values?.buckets !== undefined
                        ? ((
                              <Typography variant="caption" display="block">
                                  <T
                                      keyName="hits_buckets"
                                      params={{
                                          moreThen: aggregations?.values?.buckets.length >= DEFAULT_FACET_SIZE ? 'yes' : 'no',
                                          hits: formatThousands(aggregations?.values?.buckets.reduce((acc, { doc_count }) => acc + doc_count, 0)),
                                          buckets: aggregations?.values?.buckets.length,
                                      }}
                                  >
                                      {'{moreThen, select, yes {> } other {}}{hits} hits, {buckets} buckets'}
                                  </T>
                              </Typography>
                          ) as unknown as string)
                        : undefined
                }
            >
                <DateRangeFilter
                    defaultFrom={queryFilter?.from}
                    defaultTo={queryFilter?.to}
                    onChange={handleDateRangeChange(field)}
                    loading={loading}
                />

                <ListItem>
                    <IntervalSelect field={field} />
                </ListItem>

                <AggregationFilter
                    field={field}
                    queryFilter={queryFilter?.intervals}
                    queryFacets={queryFacets}
                    aggregations={aggregations?.values}
                    loading={loading}
                    onChange={handleDateSelectionChange}
                    bucketLabel={formatLabel}
                    bucketSubLabel={interval === 'week' ? formatWeekStart : undefined}
                    bucketValue={formatValue}
                    quickFilter={quickFilter}
                />
            </Expandable>
        )
    },
)
