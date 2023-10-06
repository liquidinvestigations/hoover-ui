import { Button, Grid, List, ListItem, TextField } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { T } from '@tolgee/react'
import { DateTime } from 'luxon'
import { FC, useEffect, useState } from 'react'

import { DATE_FORMAT } from '../../../constants/general'
import { reactIcons } from '../../../constants/icons'

const icons = {
    leftArrowIcon: reactIcons.chevronLeft,
    rightArrowIcon: reactIcons.chevronRight,
    keyboardIcon: reactIcons.event,
}

const emptyLabel = 'YYYY-MM-DD'

interface DateRangeFilterProps {
    defaultFrom?: string
    defaultTo?: string
    onChange: (range?: { from?: string; to?: string }) => void
    loading: boolean
}

export const DateRangeFilter: FC<DateRangeFilterProps> = ({ defaultFrom, defaultTo, onChange, loading }) => {
    const [from, setFrom] = useState<string | undefined>(defaultFrom)
    const [to, setTo] = useState<string | undefined>(defaultTo)

    const handleFromChange = (date: DateTime | null) => setFrom(date?.toFormat(DATE_FORMAT))
    const handleToChange = (date: DateTime | null) => setTo(date?.toFormat(DATE_FORMAT))

    const handleApply = () => onChange({ from, to })
    const handleReset = () => {
        setFrom(undefined)
        setTo(undefined)
        from && to && onChange()
    }

    const unedited = defaultFrom === from && defaultTo === to

    useEffect(() => {
        setFrom(defaultFrom)
        setTo(defaultTo)
    }, [defaultFrom, defaultTo])

    return (
        <List disablePadding>
            <ListItem>
                <DatePicker
                    renderInput={(props) => <TextField {...props} />}
                    value={from}
                    label={from ? null : emptyLabel}
                    inputFormat={DATE_FORMAT}
                    onChange={handleFromChange}
                    maxDate={to as unknown as DateTime}
                    openTo="year"
                    disabled={loading}
                    {...icons}
                />
            </ListItem>

            <ListItem>
                <DatePicker
                    renderInput={(props) => <TextField {...props} />}
                    value={to}
                    label={to ? null : emptyLabel}
                    inputFormat={DATE_FORMAT}
                    minDate={from as unknown as DateTime}
                    onChange={handleToChange}
                    openTo="year"
                    disabled={loading}
                    {...icons}
                />
            </ListItem>

            <ListItem>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Button size="small" onClick={handleReset} disabled={loading || (!from && !to)}>
                            <T keyName="reset">Reset</T>
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button size="small" onClick={handleApply} disabled={loading || !from || !to || unedited}>
                            <T keyName="apply">Apply</T>
                        </Button>
                    </Grid>
                </Grid>
            </ListItem>
        </List>
    )
}
