import React, { forwardRef, memo, useCallback, useMemo, useState } from 'react'
import { DateTime } from 'luxon'
import { Box, Grid, Menu, MenuItem, Tooltip, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors'
import Loading from '../Loading'
import { useSearch } from './SearchProvider'
import IntervalSelect from './IntervalSelect'
import Pagination from './filters/Pagination'
import { formatsLabel, formatsValue } from './filters/DateHistogramFilter'
import { DEFAULT_INTERVAL } from '../../constants/general'
import { formatThousands } from '../../utils'

const height = 100
const barWidth = 10
const barMargin = 1

const useStyles = makeStyles(theme => ({
    histogramTitle: {
        marginTop: theme.spacing(1),
    },
    chartBox: {
        height,
        marginBottom: theme.spacing(1)
    }
}))

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
    const { aggregations, query, search, aggregationsLoading, resultsLoading } = useSearch()

    const [width, setWidth] = useState(0)

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

    const handleFilter = useCallback(() => {
        handleBarMenuClose()

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

    const selected = query.filters?.[field]?.intervals?.include

    const loading = aggregationsLoading || resultsLoading

    const bars = useMemo(() => {
        const data = aggregations?.[field]?.values.buckets

        if (data) {
            const maxCount = Math.max(...data.map(({doc_count}) => doc_count))

            let missingBarsCount = 0
            const elements = data.map(({key_as_string, doc_count}, index) => {
                if (index) {
                    const unit = `${interval}s`
                    const prevDate = DateTime.fromISO(data[index - 1].key_as_string)
                    const currDate = DateTime.fromISO(key_as_string)
                    missingBarsCount += prevDate.diff(currDate, unit)[unit] - 1
                }

                const barHeight = height * Math.log(doc_count + 1) / Math.log(maxCount + 1)

                return (
                    <Tooltip
                        key={index}
                        placement="top"
                        title={<>{formatLabel(key_as_string)}: <strong>{formatThousands(doc_count)}</strong></>}
                    >
                        <Bar
                            x={(index + missingBarsCount) * (barWidth + barMargin)}
                            y={height - barHeight}
                            width={barWidth}
                            height={barHeight}
                            className={selected?.includes(formatValue(key_as_string)) ? 'selected' : undefined}
                            onClick={loading ? null : handleBarClick(formatValue(key_as_string))}
                        />
                    </Tooltip>
                )
            })

            setWidth(elements.length === 0 ? 0 :
                (elements.length + missingBarsCount) * (barWidth + barMargin) - barMargin)

            return elements
        }
    }, [aggregations, loading, selected])

    return (
        <Box>
            <Typography variant="h6" className={classes.histogramTitle}>
                {title}
            </Typography>
            <div className={classes.chartBox}>
                {loading ? <Loading /> : width > 0 && (
                    <Chart height={height} width={width} style={{ width: '100%' }}>
                        {bars}
                    </Chart>
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
            <Menu
                open={!!anchorPosition}
                onClose={handleBarMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={anchorPosition}
            >
                <MenuItem onClick={handleFilter}>
                    {selected?.includes(selectedBar) ? 'Remove filter' : 'Filter'}
                </MenuItem>
            </Menu>
        </Box>
    )
}

export default memo(Histogram)
