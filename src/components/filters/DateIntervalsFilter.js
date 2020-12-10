import React, { memo, useCallback } from 'react'
import { DateTime } from 'luxon'
import { FormControl, FormHelperText, ListItem, MenuItem, Select } from '@material-ui/core'
import Filter from './Filter'
import DateRangeFilter from './DateRangeFilter'
import AggregationFilter from './AggregationFilter'
import { DEFAULT_INTERVAL } from '../../constants'

const timeBucketSorter = (a, b) => b.key - a.key
const formatsLabel = {
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

function DateIntervalsFilter({ title, value, aggregation, disabled, onChange }) {
    const onRangeChange = range => {
        const { from, to, interval, intervals, ...rest } = value || {}
        if (range?.from && range?.to) {
            onChange({...range, ...rest})
        } else {
            onChange(rest)
        }
    }

    const onIntervalChange = event => {
        const { interval, intervals, ...rest } = value || {}
        onChange({interval: event.target.value, ...rest})
    }

    const onSelectionChange = newIntervals => {
        const { intervals, ...rest } = value || {}
        if (newIntervals.length) {
            onChange({ intervals: newIntervals, ...rest })
        } else {
            onChange(rest)
        }
    }

    const interval = value?.interval || DEFAULT_INTERVAL

    const formatLabel = useCallback(
        bucket => DateTime.fromISO(bucket.key_as_string).toFormat(formatsLabel[interval]),
        [interval]
    )

    const formatWeekStart = bucket => DateTime
        .fromISO(bucket.key_as_string)
        .toFormat("('starting' d MMMM)")

    const formatValue = useCallback(
        bucket => DateTime
            .fromISO(bucket.key_as_string, { setZone: true })
            .toFormat(formatsValue[interval]),
        [interval]
    )

    return (
        <Filter
            title={title}
            defaultOpen={!!(value?.from || value?.to || value?.intervals)}>
            <DateRangeFilter
                defaultFrom={value?.from}
                defaultTo={value?.to}
                onChange={onRangeChange}
                disabled={disabled}
            />

            <ListItem>
                <FormControl size="small" fullWidth>
                    <Select
                        value={interval}
                        onChange={onIntervalChange}
                    >
                        <MenuItem value="year">Year</MenuItem>
                        <MenuItem value="month">Month</MenuItem>
                        <MenuItem value="week">Week</MenuItem>
                        <MenuItem value="day">Day</MenuItem>
                        <MenuItem value="hour">Hour</MenuItem>
                    </Select>
                    <FormHelperText>Aggregation</FormHelperText>
                </FormControl>
            </ListItem>

            <AggregationFilter
                disabled={disabled}
                selected={value?.intervals}
                aggregation={aggregation}
                onChange={onSelectionChange}
                sortBuckets={timeBucketSorter}
                bucketLabel={formatLabel}
                bucketSubLabel={interval === 'week' ? formatWeekStart : null}
                bucketValue={formatValue}
            />
        </Filter>
    )
}

export default memo(DateIntervalsFilter)
