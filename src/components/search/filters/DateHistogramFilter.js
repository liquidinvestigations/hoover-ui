import React, { memo, useCallback } from 'react'
import { DateTime } from 'luxon'
import { Divider, FormControl, FormHelperText, ListItem, MenuItem, Select } from '@material-ui/core'
import Expandable from '../../Expandable'
import DateRangeFilter from './DateRangeFilter'
import AggregationFilter from './AggregationFilter'
import { DEFAULT_INTERVAL } from '../../../constants'

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

function DateHistogramFilter({ title, field, queryField, queryFacets, aggregations,
                                 disabled, onChange, onPagination }) {

    const interval = queryField?.interval || DEFAULT_INTERVAL

    const onRangeChange = useCallback(range => {
        const { from, to, interval, intervals, ...rest } = queryField || {}
        if (range?.from && range?.to) {
            onChange(field, {...range, ...rest}, true)
        } else {
            onChange(field, rest, true)
        }
    }, [field, queryField, onChange])

    const onIntervalChange = useCallback(event => {
        const { interval, intervals, ...rest } = queryField || {}
        onChange(field, {interval: event.target.value, ...rest}, true)
    }, [field, queryField, onChange])

    const onSelectionChange = useCallback((field, newIntervals, resetPage) => {
        const { intervals, ...rest } = queryField || {}
        if (newIntervals.length) {
            onChange(field, { intervals: newIntervals, ...rest }, resetPage)
        } else {
            onChange(field, rest, resetPage)
        }
    }, [field, queryField, onChange])

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
            defaultOpen={!!(queryField?.from || queryField?.to || queryField?.intervals)}>
            <DateRangeFilter
                defaultFrom={queryField?.from}
                defaultTo={queryField?.to}
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
                field={field}
                queryField={queryField}
                queryFacets={queryFacets}
                querySubField="intervals"
                aggregations={aggregations}
                disabled={disabled}
                onChange={onSelectionChange}
                onPagination={onPagination}
                bucketLabel={formatLabel}
                bucketSubLabel={interval === 'week' ? formatWeekStart : null}
                bucketValue={formatValue}
            />

            <Divider />
        </Expandable>
    )
}

export default memo(DateHistogramFilter)
