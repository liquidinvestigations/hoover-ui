import React, { memo, useCallback, useEffect, useMemo, useState } from 'react'
import cn from 'classnames'
import { DateTime } from 'luxon'
import { Collapse, Grid, IconButton, ListItem, Menu, MenuItem, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { ExpandMore } from '@material-ui/icons'
import Loading from '../../Loading'
import HistogramChart from './HistogramChart'
import IntervalSelect from './IntervalSelect'
import Pagination from './Pagination'
import { useSearch } from '../SearchProvider'
import { useHashState } from '../../HashStateProvider'
import { formatsLabel, formatsValue } from './DateHistogramFilter'
import { DATE_FORMAT, DEFAULT_INTERVAL } from '../../../constants/general'
import { daysInMonth, getClosestInterval } from '../../../utils'

const chartWidth = 300
const chartHeight = 100
const barWidth = 10
const barMargin = 1

const useStyles = makeStyles(theme => ({
    expand: {
        marginLeft: theme.spacing(2),
        transform: 'rotate(90deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },
    expandOpen: {
        transform: 'rotate(0deg)',
    },
    histogramTitle: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    chartBox: {
        marginBottom: theme.spacing(1)
    }
}))

function Histogram({ title, field }) {
    const classes = useStyles()
    const { aggregations, query, search, aggregationsLoading, resultsLoading } = useSearch()

    const { hashState, setHashState } = useHashState()
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

    const [anchorPosition, setAnchorPosition] = useState(null)
    const [selectedBars, setSelectedBars] = useState(null)

    const handleSelect = (event, bars) => {
        if (bars.length) {
            setSelectedBars(bars)
            setAnchorPosition({left: event.clientX, top: event.clientY})
        }
    }

    const handleBarMenuClose = () => setAnchorPosition(null)

    const handleIntervalsChange = include => {
        handleBarMenuClose()

        const { [field]: prevFilter, ...restFilters } = query.filters || {}
        const { intervals, ...restParams } = prevFilter || {}

        if (include.length) {
            search({ filters: { [field]: { intervals: { include }, ...restParams }, ...restFilters }, page: 1 })
        } else {
            search({ filters: { [field]: restParams, ...restFilters }, page: 1 })
        }
    }

    const handleIntervalsAdd = useCallback(() => {
        const { [field]: prevFilter } = query.filters || {}
        const { intervals } = prevFilter || {}

        handleIntervalsChange(Array.from(new Set([...(intervals?.include || []), ...selectedBars])))
    }, [query, search, selectedBars])

    const handleIntervalsRemove = useCallback(() => {
        const { [field]: prevFilter } = query.filters || {}
        const { intervals } = prevFilter || {}

        handleIntervalsChange((intervals?.include || []).filter(v => {
            return !selectedBars.includes(v)
        }))
    }, [query, search, selectedBars])

    const getDatesRange = () => {
        let first = selectedBars[selectedBars.length - 1]
        let last = selectedBars[0]

        switch (interval) {
            case 'year':
                last += '-12-31'
                break

            case 'month':
                last += '-' + daysInMonth(last)
                break

            case 'week':
                last = DateTime.fromISO(last).plus({days: 7}).toISODate()
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
        const { [field]: prevFilter, ...restFilters } = query.filters || {}
        const { [field]: prevFacet, ...restFacets } = query.facets || {}

        search({
            filters: { [field]: {...range, interval: getClosestInterval(range) }, ...restFilters },
            facets: { ...restFacets },
            page: 1
        })

    }, [query, search, selectedBars])


    const interval = query.filters?.[field]?.interval || DEFAULT_INTERVAL
    const selected = query.filters?.[field]?.intervals?.include
    const axisHeight = interval === 'year' ? 20 : 40
    const loading = aggregationsLoading || resultsLoading

    const formatLabel = value => DateTime
        .fromISO(value, { setZone: true })
        .toFormat(formatsLabel[interval])

    const formatValue = value => DateTime
        .fromISO(value, { setZone: true })
        .toFormat(formatsValue[interval])

    const data = useMemo(() => {
        const buckets = aggregations?.[field]?.values.buckets

        if (buckets) {
            let missingBarsCount = 0
            const elements = buckets.map(({key_as_string, doc_count}, index) => {
                if (index) {
                    const unit = `${interval}s`
                    const prevDate = DateTime.fromISO(buckets[index - 1].key_as_string)
                    const currDate = DateTime.fromISO(key_as_string)
                    missingBarsCount += prevDate.diff(currDate, unit)[unit] - 1
                }
                return {
                    label: formatLabel(key_as_string),
                    value: formatValue(key_as_string),
                    count: doc_count,
                    missingBarsCount
                }
            })

            const xScale = chartWidth / ((elements.length + missingBarsCount) * (barWidth + barMargin) - barMargin)
            const maxCount = Math.max(...buckets.map(({doc_count}) => doc_count))

            return elements.map(({label, value, count, missingBarsCount}, index) => ({
                label,
                value,
                count,
                barWidth: barWidth * xScale,
                barHeight: (chartHeight - axisHeight) * Math.log(count + 1) / Math.log(maxCount + 1),
                barPosition: (index + missingBarsCount) * (barWidth + barMargin) * xScale,
                labelPosition: ((index + missingBarsCount) * (barWidth + barMargin) + barWidth / 2) * xScale
            }))
        }
    }, [aggregations])

    return (
        <>
            <ListItem onClick={toggle} button dense className={classes.histogramTitle}>
                <Grid container
                      className={classes.histogramTitle}
                      justify="space-between"
                      alignItems="center"
                      wrap="nowrap"
                >
                    <Grid item>
                        <Typography variant="h6">
                            {title}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <IconButton
                            size="small"
                            className={cn(classes.expand, { [classes.expandOpen]: open })}
                            aria-expanded={open}
                            aria-label="Show histogram"
                        >
                            <ExpandMore color="action" />
                        </IconButton>
                    </Grid>
                </Grid>
            </ListItem>

            <Collapse in={open}>
                <div className={classes.chartBox}>
                    {loading ? <Loading /> : (
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
                <Grid container justify="space-between">
                    <Grid item>
                        <Pagination field={field} />
                    </Grid>
                    <Grid item>
                        <IntervalSelect field={field} />
                    </Grid>
                </Grid>
            </Collapse>

            <Menu
                open={!!anchorPosition}
                onClose={handleBarMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={anchorPosition}
            >
                {selectedBars?.some(v => !selected?.includes(v)) && (
                    <MenuItem onClick={handleIntervalsAdd}>
                        select this interval
                    </MenuItem>
                )}
                {selectedBars?.some(v => selected?.includes(v)) && (
                    <MenuItem onClick={handleIntervalsRemove}>
                        remove this interval
                    </MenuItem>
                )}
                <MenuItem onClick={handleFilterRange}>
                    set filter for this interval (zoom in)
                </MenuItem>
            </Menu>
        </>
    )
}

export default memo(Histogram)
