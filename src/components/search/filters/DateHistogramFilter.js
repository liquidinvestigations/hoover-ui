import { ListItem, Typography } from '@mui/material'
import { DateTime } from 'luxon'
import { memo, useCallback, useEffect } from 'react'

import { DEFAULT_FACET_SIZE, DEFAULT_INTERVAL } from '../../../constants/general'
import { formatThousands, getClosestInterval } from '../../../utils/utils'
import { Expandable } from '../../Expandable'

import AggregationFilter from './AggregationFilter'
import DateRangeFilter from './DateRangeFilter'
import IntervalSelect from './IntervalSelect'
import useMissingLoader from './useMissingLoader'

export const formatsLabel = {
    year: 'y',
    month: 'MMMM y',
    week: "y, 'Week' W",
    day: 'd MMMM y',
    hour: 'd MMM y, h a',
}

export const formatsValue = {
    year: 'yyyy',
    month: 'yyyy-MM',
    week: 'yyyy-MM-dd',
    day: 'yyyy-MM-dd',
    hour: "yyyy-MM-dd'T'HH",
}

function DateHistogramFilter({ title, field, open, onToggle, queryFilter, queryFacets, aggregations, loading, loadingETA, missing, onChange, search }) {
    const interval = queryFilter?.interval || DEFAULT_INTERVAL

    const onRangeChange = useCallback(
        (range) => {
            const { from, to, interval, intervals, ...rest } = queryFilter || {}
            if (range?.from && range?.to) {
                onChange(field, { ...range, interval: getClosestInterval({ ...range, interval }), ...rest }, true)
            } else {
                onChange(field, rest, true)
            }
        },
        [field, queryFilter, onChange]
    )

    const onSelectionChange = useCallback(
        (field, newIntervals, resetPage) => {
            const { intervals, missing, ...rest } = queryFilter || {}
            if (newIntervals.include?.length || newIntervals.missing) {
                onChange(field, { intervals: newIntervals, ...rest }, resetPage)
            } else {
                onChange(field, rest, resetPage)
            }
        },
        [field, queryFilter, onChange]
    )

    const formatLabel = useCallback((bucket) => DateTime.fromISO(bucket.key_as_string).toFormat(formatsLabel[interval]), [interval])

    const formatWeekStart = useCallback((bucket) => DateTime.fromISO(bucket.key_as_string).toFormat("('starting' d MMMM)"), [])

    const formatValue = useCallback((bucket) => DateTime.fromISO(bucket.key_as_string, { setZone: true }).toFormat(formatsValue[interval]), [interval])

    const { missingLoading, missingLoadingETA } = useMissingLoader(open, missing, field)

    return (
        <Expandable
            title={title}
            loading={loading}
            loadingETA={loadingETA}
            highlight={!!(queryFilter?.from || queryFilter?.to || queryFilter?.intervals)}
            greyed={!aggregations?.values.buckets.length}
            open={open}
            onToggle={onToggle}
            resizable={false}
            summary={
                !!aggregations?.values.buckets.length && (
                    <Typography variant="caption" display="block">
                        {aggregations?.values.buckets.length >= DEFAULT_FACET_SIZE && '> '}
                        {formatThousands(aggregations?.values.buckets.reduce((acc, { doc_count }) => acc + parseInt(doc_count), 0))} hits
                        {', '}
                        {aggregations?.values.buckets.length} buckets
                    </Typography>
                )
            }>
            <DateRangeFilter defaultFrom={queryFilter?.from} defaultTo={queryFilter?.to} onChange={onRangeChange} loading={loading} />

            <ListItem>
                <IntervalSelect field={field} />
            </ListItem>

            <AggregationFilter
                field={field}
                queryFilter={queryFilter?.intervals}
                queryFacets={queryFacets}
                aggregations={aggregations}
                loading={loading}
                missing={missing}
                missingLoading={missingLoading}
                missingLoadingETA={missingLoadingETA}
                onChange={onSelectionChange}
                bucketLabel={formatLabel}
                bucketSubLabel={interval === 'week' ? formatWeekStart : null}
                bucketValue={formatValue}
                search={search}
            />
        </Expandable>
    )
}

export default memo(DateHistogramFilter)
