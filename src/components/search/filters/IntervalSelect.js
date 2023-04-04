import { FormControl, FormHelperText, MenuItem, Select } from '@mui/material'

import { DEFAULT_INTERVAL } from '../../../constants/general'
import { defaultSearchParams } from '../../../utils/queryUtils'
import { useSearch } from '../SearchProvider'

export default function IntervalSelect({ field }) {
    const { query, search } = useSearch()

    const onIntervalChange = (event) => {
        const { [field]: prevFilter, ...restFilters } = query.filters || {}
        const { [field]: prevFacet, ...restFacets } = query.facets || {}

        const { interval, intervals, ...rest } = query.filters?.[field] || {}
        const newFilter = { interval: event.target.value, ...rest }

        if (event.target.value !== DEFAULT_INTERVAL) {
            search({ filters: { [field]: newFilter, ...restFilters }, facets: { ...restFacets }, page: defaultSearchParams.page })
        } else {
            search({ filters: { ...restFilters }, facets: { ...restFacets }, page: defaultSearchParams.page })
        }
    }

    const interval = query.filters?.[field]?.interval || DEFAULT_INTERVAL

    return (
        <FormControl variant="standard" size="small" fullWidth>
            <Select variant="standard" value={interval} onChange={onIntervalChange}>
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
