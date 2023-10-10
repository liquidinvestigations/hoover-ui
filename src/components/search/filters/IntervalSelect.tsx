import { FormControl, FormHelperText, MenuItem, Select } from '@mui/material'
import { SelectChangeEvent } from '@mui/material/Select/SelectInput'
import { T } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { DEFAULT_INTERVAL } from '../../../constants/general'
import { SourceField } from '../../../Types'
import { defaultSearchParams } from '../../../utils/queryUtils'
import { useSharedStore } from '../../SharedStoreProvider'

export const IntervalSelect: FC<{ field: SourceField }> = observer(({ field }) => {
    const { query, search } = useSharedStore().searchStore

    const onIntervalChange = (event: SelectChangeEvent) => {
        const { [field]: prevFilter, ...restFilters } = query?.filters || {}
        const { [field]: prevFacet, ...restFacets } = query?.facets || {}

        const { interval, intervals, ...rest } = query?.filters?.[field] || {}
        const newFilter = { interval: event.target.value, ...rest }

        if (event.target.value !== DEFAULT_INTERVAL) {
            search({ filters: { [field]: newFilter, ...restFilters }, facets: { ...restFacets }, page: defaultSearchParams.page })
        } else {
            search({ filters: { ...restFilters }, facets: { ...restFacets }, page: defaultSearchParams.page })
        }
    }

    const interval = query?.filters?.[field]?.interval || DEFAULT_INTERVAL

    return (
        <FormControl variant="standard" size="small" fullWidth>
            <Select variant="standard" value={interval} onChange={onIntervalChange}>
                <MenuItem value="year">
                    <T keyName="year">Year</T>
                </MenuItem>
                <MenuItem value="month">
                    <T keyName="month">Month</T>
                </MenuItem>
                <MenuItem value="week">
                    <T keyName="week">Week</T>
                </MenuItem>
                <MenuItem value="day">
                    <T keyName="day">Day</T>
                </MenuItem>
                <MenuItem value="hour">
                    <T keyName="hour">Hour</T>
                </MenuItem>
            </Select>
            <FormHelperText>
                <T keyName="aggregation">Aggregation</T>
            </FormHelperText>
        </FormControl>
    )
})
