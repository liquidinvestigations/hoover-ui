import React, { memo, useCallback } from 'react'
import { DateTime } from 'luxon'
import { ListItem } from '@material-ui/core'
import Expandable from '../../Expandable'
import IntervalSelect from './IntervalSelect'
import DateRangeFilter from './DateRangeFilter'
import AggregationFilter from './AggregationFilter'
import { DEFAULT_INTERVAL } from '../../../constants/general'
import { getClosestInterval } from '../../../utils'

export const formatsLabel = {
    year: 'y',
    month: 'MMMM y',
    week: "y, 'Week' W",
    day: 'd MMMM y',
    hour: "d MMM y, h a",
}

export const formatsValue = {
    year: 'yyyy',
    month: 'yyyy-MM',
    week: 'yyyy-MM-dd',
    day: 'yyyy-MM-dd',
    hour: "yyyy-MM-dd'T'HH",
}

function DateHistogramFilter({ title, open, onToggle, field, queryFilter, aggregations, missing, loading, onChange }) {
    const interval = queryFilter?.interval || DEFAULT_INTERVAL

    const onRangeChange = useCallback(range => {
        const { from, to, interval, intervals, ...rest } = queryFilter || {}
        if (range?.from && range?.to) {
            onChange(field, {...range, interval: getClosestInterval({...range, interval}), ...rest}, true)
        } else {
            onChange(field, rest, true)
        }
    }, [field, queryFilter, onChange])

    const onSelectionChange = useCallback((field, newIntervals, resetPage) => {
        const { intervals, missing, ...rest } = queryFilter || {}
        if (newIntervals.include?.length || newIntervals.missing) {
            onChange(field, { intervals: newIntervals, ...rest }, resetPage)
        } else {
            onChange(field, rest, resetPage)
        }
    }, [field, queryFilter, onChange])

    const formatLabel = useCallback(
        bucket => DateTime.fromISO(bucket.key_as_string).toFormat(formatsLabel[interval]),
        [interval]
    )

    const formatWeekStart = useCallback(bucket => DateTime
        .fromISO(bucket.key_as_string)
        .toFormat("('starting' d MMMM)")
    , [])

    const formatValue = useCallback(
        bucket => DateTime
            .fromISO(bucket.key_as_string, { setZone: true })
            .toFormat(formatsValue[interval]),
        [interval]
    )

    return (
        <Expandable
            title={title}
            highlight={!!(queryFilter?.from || queryFilter?.to || queryFilter?.intervals)}
            greyed={!aggregations?.values.buckets.length}
            open={open}
            onToggle={onToggle}
            resizable={false}
        >
            <DateRangeFilter
                defaultFrom={queryFilter?.from}
                defaultTo={queryFilter?.to}
                onChange={onRangeChange}
                loading={loading}
            />

            <ListItem>
                <IntervalSelect field={field} />
            </ListItem>

            <AggregationFilter
                field={field}
                queryFilter={queryFilter?.intervals}
                aggregations={aggregations}
                missing={missing}
                loading={loading}
                onChange={onSelectionChange}
                bucketLabel={formatLabel}
                bucketSubLabel={interval === 'week' ? formatWeekStart : null}
                bucketValue={formatValue}
            />
        </Expandable>
    )
}

export default memo(DateHistogramFilter)
