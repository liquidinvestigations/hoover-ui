import React, { memo, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Event } from '@material-ui/icons'
import { Button, Grid, List, ListItem } from '@material-ui/core'
import { KeyboardDatePicker } from '@material-ui/pickers'
import { DATE_FORMAT } from '../../../constants/general'

const icons = {
    leftArrowIcon: <ArrowLeft />,
    rightArrowIcon: <ArrowRight />,
    keyboardIcon: <Event />,
}

const emptyLabel = 'YYYY-MM-DD'

function DateRangeFilter({ defaultFrom, defaultTo, onChange, disabled }) {
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
        return date.isValid ? date.toFormat(DATE_FORMAT) : invalidLabel
    }

    useEffect(() => {
        setFrom(defaultFrom)
        setTo(defaultTo)
    }, [defaultFrom, defaultTo])

    return (
        <List>
            <ListItem>
                <KeyboardDatePicker
                    value={from}
                    label={from ? null : emptyLabel}
                    labelFunc={labelFunc(from)}
                    format={DATE_FORMAT}
                    onChange={handleFromChange}
                    maxDate={to}
                    openTo="year"
                    disabled={disabled}
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
                    disabled={disabled}
                    autoOk
                    fullWidth
                    {...icons}
                />
            </ListItem>

            <ListItem>
                <Grid container alignItems="center" justify="space-between">
                    <Grid item>
                        <Button
                            size="small"
                            onClick={handleReset}
                            disabled={disabled || (!from && !to)}>
                            Reset
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            size="small"
                            onClick={handleApply}
                            disabled={disabled || !from || !to || unedited}>
                            Apply
                        </Button>
                    </Grid>
                </Grid>
            </ListItem>
        </List>
    )
}

export default memo(DateRangeFilter)
