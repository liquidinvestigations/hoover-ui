import React, { forwardRef, memo, useCallback, useMemo, useState } from 'react'
import { DateTime, Duration } from 'luxon'
import { Box, ButtonBase, FormControl, Grid, Menu, MenuItem, Tooltip, Typography } from '@material-ui/core'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors'
import { useSearch } from './SearchProvider'
import { formatsLabel, formatsValue } from './filters/DateHistogramFilter'
import { DEFAULT_INTERVAL } from '../../constants/general'
import { formatThousands } from '../../utils'
import Loading from '../Loading'
import IntervalSelect from './IntervalSelect'

const useStyles = makeStyles(theme => ({
    histogramTitle: {
        marginTop: theme.spacing(1),
    }
}))

const height = 100

const Chart = ({ children, height, width }) => (
    <svg viewBox={`0 0 ${width} ${height}`} height={height} width="100%" preserveAspectRatio="none">
        <style>{`
            rect {
                fill: ${blue[300]};
                cursor: pointer;
            }
            rect.selected {
                fill: rgb(245, 0, 87);
            }
        `}</style>
        {children}
    </svg>
)

const Bar = forwardRef((props, ref) => <rect ref={ref} {...props} />)

function Histogram({ title, field }) {
    const classes = useStyles()
    const { aggregations, query, search, aggregationsLoading } = useSearch()

    const [filterChanging, setFilterChanging] = useState(false)

    const [anchorPosition, setAnchorPosition] = useState(null)
    const [selectedBar, setSelectedBar] = useState(null)

    const handleBarClick = bar => event => {
        setSelectedBar(bar)
        setAnchorPosition({ left: event.clientX, top: event.clientY })
    }

    const handleBarMenuClose = () => {
        setAnchorPosition(null)
    }

    const interval = query.filters?.[field]?.interval || DEFAULT_INTERVAL

    const formatLabel = value => DateTime
        .fromISO(value, { setZone: true })
        .toFormat(formatsLabel[interval])

    const formatValue = value => DateTime
        .fromISO(value, { setZone: true })
        .toFormat(formatsValue[interval])

    const data = useMemo(() => {
        setFilterChanging(false)
        const bucketsWithMissing = []
        if (!aggregations) {
            return bucketsWithMissing
        }

        return Object.fromEntries(aggregations[field].values.buckets.map(({doc_count, key_as_string}) => ([
            key_as_string,
            {
                doc_count,
                label: formatLabel(key_as_string),
                value: formatValue(key_as_string),
            }
        ])))
    }, [aggregations, interval])

    const handleFilter = useCallback(() => {
        handleBarMenuClose()
        setFilterChanging(true)
        const { [field]: prevFilter, ...restFilters } = query.filters || {}
        const { intervals, ...rest } = prevFilter || {}
        let newIntervals = null

        if (intervals?.include?.includes(selectedBar)){
            if (intervals.include.length > 1) {
                const newInclude = [...intervals.include]
                newInclude.splice(intervals.include.indexOf(selectedBar), 1)
                newIntervals = { include: newInclude }
            }
        } else if (intervals?.include?.length) {
            newIntervals = { include: [...intervals.include, selectedBar] }
        } else {
            newIntervals = { include: [selectedBar] }
        }

        if (newIntervals) {
            search({ filters: { [field]: { intervals: newIntervals, ...rest }, ...restFilters }, page: 1 })
        } else {
            search({ filters: { [field]: rest, ...restFilters }, page: 1 })
        }
    }, [query, search, selectedBar])

    const barWidth = 10
    const barMargin = 1
    const [width, setWidth] = useState(0)

    const maxCount = useMemo(() => {
        return data && Math.max(...Object.entries(data).map(([,{doc_count}]) => doc_count))
    }, [data])

    const bars = useMemo(() => {
        const items = []
        const sortedBuckets = Object.entries(data).map(([key]) => key).sort()
        let currentBucket = sortedBuckets[0], index = 0

        while (currentBucket <= sortedBuckets[sortedBuckets.length - 1]) {
            if (data[currentBucket]) {
                const item = data[currentBucket]
                const barHeight = height * Math.log(item.doc_count + 1) / Math.log(maxCount + 1)
                items.push(
                    <Tooltip
                        key={index}
                        title={<>{item.label}: <strong>{formatThousands(item.doc_count)}</strong></>}
                        placement="top"
                    >
                        <Bar
                            key={item.label}
                            x={index * (barWidth + barMargin)}
                            y={height - barHeight}
                            width={barWidth}
                            height={barHeight}
                            className={query.filters?.[field]?.intervals?.include?.includes(item.value) ?
                                'selected' : undefined}
                            onClick={aggregationsLoading ? null : handleBarClick(item.value)}
                        />
                    </Tooltip>
                )
            }
            currentBucket = DateTime.fromISO(currentBucket, { setZone: true }).plus(
                Duration.fromObject({ [`${interval}s`]: 1 })
            ).toISO()

            index++
        }
        setWidth(index === 0 ? 0 : index * (barWidth + barMargin) - barMargin)

        return items

    }, [data, aggregationsLoading])

    return !data ? null : (
        <Box>
            <Typography variant="h6" className={classes.histogramTitle}>
                {title}
            </Typography>
            {aggregationsLoading && !filterChanging ? <Loading/> :
                <Chart height={height} width={width} style={{ width: '100%' }}>
                    {bars}
                </Chart>
            }
            <IntervalSelect field={field} />
            <Menu
                open={!!anchorPosition}
                onClose={handleBarMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={anchorPosition}
            >
                <MenuItem onClick={handleFilter}>
                    {query.filters?.[field]?.intervals?.include?.includes(selectedBar) ? 'Remove filter' : 'Filter'}
                </MenuItem>
            </Menu>
        </Box>
    )
}

export default memo(Histogram)
