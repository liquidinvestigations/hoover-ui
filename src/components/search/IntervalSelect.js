import React from 'react'
import { FormControl, FormHelperText, MenuItem, Select } from '@material-ui/core'
import { useSearch } from './SearchProvider'
import { DEFAULT_INTERVAL } from '../../constants/general'

export default function IntervalSelect({ field }) {
    const { query, search } = useSearch()

    const onIntervalChange = event => {
        const { [field]: prevFilter, ...restFilters } = query.filters || {}
        const { [field]: prevFacet, ...restFacets } = query.facets || {}

        const { interval, intervals, ...rest } = query.filters?.[field] || {}
        const newFilter = { interval: event.target.value, ...rest }

        search({ filters: { [field]: newFilter, ...restFilters }, facets: { ...restFacets }, page: 1 })
    }

    const interval = query.filters?.[field]?.interval || DEFAULT_INTERVAL

    return (
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
    )
}
