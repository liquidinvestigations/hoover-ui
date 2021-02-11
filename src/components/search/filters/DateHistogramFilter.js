import React, { memo, useCallback } from 'react'
import { DateTime } from 'luxon'
import { Divider, FormControl, FormHelperText, ListItem, MenuItem, Select } from '@material-ui/core'
import Expandable from '../../Expandable'
import DateRangeFilter from './DateRangeFilter'
import AggregationFilter from './AggregationFilter'
import { DEFAULT_INTERVAL } from '../../../constants/general'

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

function DateHistogramFilter({ title, field, queryFilter, queryFacets, aggregations,
                                 loading, onChange, onPagination }) {

    const interval = queryFilter?.interval || DEFAULT_INTERVAL

    const onRangeChange = useCallback(range => {
        const { from, to, interval, intervals, ...rest } = queryFilter || {}
        if (range?.from && range?.to) {
            onChange(field, {...range, ...rest}, true)
        } else {
            onChange(field, rest, true)
        }
    }, [field, queryFilter, onChange])

    const onIntervalChange = useCallback(event => {
        const { interval, intervals, ...rest } = queryFilter || {}
        onChange(field, {interval: event.target.value, ...rest}, true)
    }, [field, queryFilter, onChange])

    const onSelectionChange = useCallback((field, newIntervals, resetPage) => {
        const { intervals, ...rest } = queryFilter || {}
        if (newIntervals.include?.length) {
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
            defaultOpen={!!(queryFilter?.from || queryFilter?.to || queryFilter?.intervals)}>
            <DateRangeFilter
                defaultFrom={queryFilter?.from}
                defaultTo={queryFilter?.to}
                onChange={onRangeChange}
                loading={loading}
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
                queryFilter={queryFilter?.intervals}
                queryFacets={queryFacets}
                aggregations={aggregations}
                loading={loading}
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
