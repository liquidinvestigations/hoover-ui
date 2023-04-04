import { Collapse, Grid, IconButton, ListItem, Menu, MenuItem, Typography } from '@mui/material'
import cx from 'classnames'
import { DateTime, DurationUnit } from 'luxon'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC, useCallback, useEffect, useMemo, useState } from 'react'

import { DATE_FORMAT, DEFAULT_INTERVAL } from '../../../../constants/general'
import { reactIcons } from '../../../../constants/icons'
import { SourceField } from '../../../../Types'
import { defaultSearchParams } from '../../../../utils/queryUtils'
import { daysInMonth, getClosestInterval } from '../../../../utils/utils'
import Loading from '../../../Loading'
import { useSharedStore } from '../../../SharedStoreProvider'
import { formatsLabel, formatsValue } from '../DateHistogramFilter'
import { IntervalSelect } from '../IntervalSelect'
import { Pagination } from '../Pagination/Pagination'

import { useStyles } from './Histogram.styles'
import { HistogramBar, HistogramChart } from './HistogramChart'

const chartWidth = 300
const chartHeight = 100
const barWidth = 10
const barMargin = 1

interface HistogramProps {
    title: string
    field: SourceField
}

export const Histogram: FC<HistogramProps> = observer(({ title, field }) => {
    const { classes } = useStyles()
    const {
        query,
        search,
        searchAggregationsStore: { aggregations, aggregationsLoading },
    } = useSharedStore().searchStore

    const { hashState, setHashState } = useSharedStore().hashStore
    const [open, setOpen] = useState(false)
    useEffect(() => {
        if (hashState?.histogram?.[field]) {
            setOpen(true)
        } else {
            setOpen(false)
        }
    }, [hashState?.histogram])

    const toggle = () => {
        setOpen(!open)

        const { [field]: prevState, ...restState } = hashState?.histogram || {}
        if (!open) {
            setHashState({ histogram: { [field]: true, ...restState } }, false)
        } else {
            setHashState({ histogram: { ...restState } }, false)
        }
    }

    const [anchorPosition, setAnchorPosition] = useState<{ left: number; top: number } | undefined>()
    const [selectedBars, setSelectedBars] = useState<string[]>()

    const handleSelect = (event: MouseEvent, bars: string[]) => {
        if (bars.length) {
            setSelectedBars(bars)
            setAnchorPosition({ left: event.clientX, top: event.clientY })
        }
    }

    const handleBarMenuClose = () => setAnchorPosition(undefined)

    const handleIntervalsChange = (include: string[]) => {
        handleBarMenuClose()

        const { [field]: prevFilter, ...restFilters } = query?.filters || {}
        const { intervals, ...restParams } = prevFilter || {}

        if (include.length) {
            search({ filters: { [field]: { intervals: { include }, ...restParams }, ...restFilters }, page: defaultSearchParams.page })
        } else {
            search({ filters: { [field]: restParams, ...restFilters }, page: defaultSearchParams.page })
        }
    }

    const handleIntervalsAdd = useCallback(() => {
        const { [field]: prevFilter } = query?.filters || {}
        const { intervals } = prevFilter || {}

        handleIntervalsChange(Array.from(new Set([...(intervals?.include || []), ...(selectedBars || [])])))
    }, [query, search, selectedBars])

    const handleIntervalsRemove = useCallback(() => {
        const { [field]: prevFilter } = query?.filters || {}
        const { intervals } = prevFilter || {}

        handleIntervalsChange(
            (intervals?.include || []).filter((v: string) => {
                return !selectedBars?.includes(v)
            })
        )
    }, [query, search, selectedBars])

    const getDatesRange = () => {
        let first = selectedBars?.[selectedBars.length - 1] as string
        let last = selectedBars?.[0] as string

        switch (interval) {
            case 'year':
                last += '-12-31'
                break

            case 'month':
                last += '-' + daysInMonth(last)
                break

            case 'week':
                last = DateTime.fromISO(last).plus({ days: 7 }).toISODate()
                break
        }

        return {
            from: DateTime.fromISO(first).toFormat(DATE_FORMAT),
            to: DateTime.fromISO(last).toFormat(DATE_FORMAT),
            interval,
        }
    }

    const handleFilterRange = useCallback(() => {
        handleBarMenuClose()
        const range = getDatesRange()
        const { [field]: prevFilter, ...restFilters } = query?.filters || {}
        const { [field]: prevFacet, ...restFacets } = query?.facets || {}

        search({
            filters: { [field]: { ...range, interval: getClosestInterval(range) }, ...restFilters },
            facets: { ...restFacets },
            page: defaultSearchParams.page,
        })
    }, [query, search, selectedBars])

    const interval = query?.filters?.[field]?.interval || DEFAULT_INTERVAL
    const selected = query?.filters?.[field]?.intervals?.include
    const axisHeight = interval === 'year' ? 20 : 40

    const formatLabel = (value: string) => DateTime.fromISO(value, { setZone: true }).toFormat(formatsLabel[interval])

    const formatValue = (value: string) => DateTime.fromISO(value, { setZone: true }).toFormat(formatsValue[interval])

    const buckets = aggregations?.[field]?.values.buckets
    const data = useMemo(() => {
        if (buckets) {
            let missingBarsCount = 0
            const elements = buckets.map(({ key_as_string, doc_count }, index) => {
                if (index) {
                    const unit = `${interval}s` as DurationUnit
                    const prevDate = DateTime.fromISO(buckets[index - 1].key_as_string as string)
                    const currDate = DateTime.fromISO(key_as_string as string)
                    missingBarsCount += prevDate.diff(currDate, unit)[unit as 'years' | 'months' | 'weeks' | 'days'] - 1
                }
                return {
                    label: formatLabel(key_as_string as string),
                    value: formatValue(key_as_string as string),
                    count: doc_count,
                    missingBarsCount,
                }
            })

            const xScale = chartWidth / ((elements.length + missingBarsCount) * (barWidth + barMargin) - barMargin)
            const maxCount = Math.max(...buckets.map(({ doc_count }) => doc_count))

            return elements.map(
                ({ label, value, count, missingBarsCount }, index) =>
                    ({
                        label,
                        value,
                        count,
                        barWidth: barWidth * xScale,
                        barHeight: ((chartHeight - axisHeight) * Math.log(count + 1)) / Math.log(maxCount + 1),
                        barPosition: (index + missingBarsCount) * (barWidth + barMargin) * xScale,
                        labelPosition: ((index + missingBarsCount) * (barWidth + barMargin) + barWidth / 2) * xScale,
                    } as HistogramBar)
            )
        }
    }, [buckets])

    return (
        <>
            <ListItem onClick={toggle} button dense className={classes.histogramTitle}>
                <Grid container className={classes.histogramTitle} justifyContent="space-between" alignItems="center" wrap="nowrap">
                    <Grid item>
                        <Typography variant="h6">{title}</Typography>
                    </Grid>
                    <Grid item>
                        <IconButton
                            size="small"
                            className={cx(classes.expand, { [classes.expandOpen]: open })}
                            aria-expanded={open}
                            aria-label="Show histogram">
                            {cloneElement(reactIcons.chevronDown, { color: 'action' })}
                        </IconButton>
                    </Grid>
                </Grid>
            </ListItem>

            <Collapse in={open}>
                <div className={classes.chartBox}>
                    {aggregationsLoading ? (
                        <Loading />
                    ) : (
                        <HistogramChart
                            width={chartWidth}
                            height={chartHeight}
                            axisHeight={axisHeight}
                            data={data}
                            selected={selected}
                            onSelect={handleSelect}
                            preserveDragArea={!!anchorPosition}
                        />
                    )}
                </div>
                <Grid container justifyContent="space-between">
                    <Grid item>
                        <Pagination field={field} />
                    </Grid>
                    <Grid item>
                        <IntervalSelect field={field} />
                    </Grid>
                </Grid>
            </Collapse>

            <Menu open={!!anchorPosition} onClose={handleBarMenuClose} anchorReference="anchorPosition" anchorPosition={anchorPosition}>
                {selectedBars?.some((v) => !selected?.includes(v)) && <MenuItem onClick={handleIntervalsAdd}>select this interval</MenuItem>}
                {selectedBars?.some((v) => selected?.includes(v)) && <MenuItem onClick={handleIntervalsRemove}>remove this interval</MenuItem>}
                <MenuItem onClick={handleFilterRange}>set filter for this interval (zoom in)</MenuItem>
            </Menu>
        </>
    )
})
