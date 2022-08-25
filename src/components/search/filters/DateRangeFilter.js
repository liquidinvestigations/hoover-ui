import React, { memo, useEffect, useState } from 'react'
import { Button, Grid, List, ListItem } from '@material-ui/core'
import { KeyboardDatePicker } from '@material-ui/pickers'
import { DATE_FORMAT } from '../../../constants/general'
import { reactIcons } from '../../../constants/icons'

const icons = {
    leftArrowIcon: reactIcons.chevronLeft,
    rightArrowIcon: reactIcons.chevronRight,
    keyboardIcon: reactIcons.event,
}

const emptyLabel = 'YYYY-MM-DD'

function DateRangeFilter({ defaultFrom, defaultTo, onChange, loading }) {
    const [from, setFrom] = useState(defaultFrom)
    const [to, setTo] = useState(defaultTo)

    const handleFromChange = date => setFrom(date?.toFormat(DATE_FORMAT))
    const handleToChange = date => setTo(date?.toFormat(DATE_FORMAT))

    const handleApply = () => onChange({ from, to })
    const handleReset = () => {
        setFrom(null)
        setTo(null)
        from && to && onChange(null)
    }

    const unedited = defaultFrom === from && defaultTo === to

    const labelFunc = field => (date, invalidLabel) => {
        if (!field) {
            return ''
        }
        return date?.isValid ? date.toFormat(DATE_FORMAT) : invalidLabel
    }

    useEffect(() => {
        setFrom(defaultFrom)
        setTo(defaultTo)
    }, [defaultFrom, defaultTo])

    return (
        <List disablePadding>
            <ListItem>
                <KeyboardDatePicker
                    value={from}
                    label={from ? null : emptyLabel}
                    labelFunc={labelFunc(from)}
                    format={DATE_FORMAT}
                    onChange={handleFromChange}
                    maxDate={to}
                    openTo="year"
                    variant="inline"
                    disabled={loading}
                    autoOk
                    fullWidth
                    {...icons}
                />
            </ListItem>

            <ListItem>
                <KeyboardDatePicker
                    value={to}
                    label={to ? null : emptyLabel}
                    labelFunc={labelFunc(to)}
                    format={DATE_FORMAT}
                    minDate={from}
                    onChange={handleToChange}
                    openTo="year"
                    variant="inline"
                    disabled={loading}
                    autoOk
                    fullWidth
                    {...icons}
                />
            </ListItem>

            <ListItem>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Button
                            size="small"
                            onClick={handleReset}
                            disabled={loading || (!from && !to)}>
                            Reset
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            size="small"
                            onClick={handleApply}
                            disabled={loading || !from || !to || unedited}>
                            Apply
                        </Button>
                    </Grid>
                </Grid>
            </ListItem>
        </List>
    )
}

export default memo(DateRangeFilter)
