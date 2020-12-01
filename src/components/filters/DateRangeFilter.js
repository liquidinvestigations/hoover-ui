import React, { memo, useEffect, useState } from 'react'
import { DateTime } from 'luxon'
import { ArrowLeft, ArrowRight, Event } from '@material-ui/icons'
import { Button, Grid, List, ListItem } from '@material-ui/core'
import { KeyboardDatePicker } from '@material-ui/pickers'

const DATE_FORMAT = 'yyyy-MM-dd';

const icons = {
    leftArrowIcon: <ArrowLeft />,
    rightArrowIcon: <ArrowRight />,
    keyboardIcon: <Event />,
}

function DateRangeFilter({ defaultFrom, defaultTo, onChange }) {
    const currentDate = DateTime.local().toFormat(DATE_FORMAT)

    const [from, setFrom] = useState(defaultFrom || currentDate)
    const [to, setTo] = useState(defaultTo || currentDate)

    const handleFromChange = date => setFrom(date.toFormat(DATE_FORMAT))
    const handleToChange = date => setTo(date.toFormat(DATE_FORMAT))

    const handleApply = () => onChange({ from, to })
    const handleReset = () => onChange(null)

    const unedited = defaultFrom === from && defaultTo === to

    useEffect(() => {
        setFrom(defaultFrom)
        setTo(defaultTo)
    }, [defaultFrom, defaultTo])

    return (
        <List>
            <ListItem>
                <KeyboardDatePicker
                    value={from}
                    format={DATE_FORMAT}
                    onChange={handleFromChange}
                    maxDate={to}
                    openTo="year"
                    autoOk
                    fullWidth
                    {...icons}
                />
            </ListItem>

            <ListItem>
                <KeyboardDatePicker
                    value={to}
                    format={DATE_FORMAT}
                    minDate={from}
                    onChange={handleToChange}
                    openTo="year"
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
                            disabled={!from && !to}>
                            Reset
                        </Button>
                    </Grid>
                    <Grid item>
                        <Button
                            size="small"
                            onClick={handleApply}
                            disabled={unedited}>
                            Apply
                        </Button>
                    </Grid>
                </Grid>
            </ListItem>
        </List>
    )
}

export default memo(DateRangeFilter)
