import React, { memo, useMemo, useState } from 'react'
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
    },
    bar: {
        flex: 1,
        margin: 1,
        backgroundColor: blue[300]
    }
}))

const height = 100

function Histogram({ title, field }) {
    const classes = useStyles()
    const theme = useTheme()
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

        const buckets = Object.fromEntries(aggregations[field].values.buckets.map(({doc_count, key_as_string}) => ([
            key_as_string,
            {
                doc_count,
                label: formatLabel(key_as_string),
                value: formatValue(key_as_string),
            }
        ])))

        const sortedBuckets = Object.entries(buckets).map(([key]) => key).sort()
        let currentBucket = sortedBuckets[0]
        while (currentBucket <= sortedBuckets[sortedBuckets.length - 1]) {
            bucketsWithMissing.push(buckets[currentBucket] || {
                doc_count: 0,
                label: formatLabel(currentBucket),
                value: formatValue(currentBucket),
            })

            currentBucket = DateTime.fromISO(currentBucket, { setZone: true }).plus(
                Duration.fromObject({ [`${interval}s`]: 1 })
            ).toISO()
        }
        return bucketsWithMissing
    }, [aggregations, interval])

    const maxCount = useMemo(() => data && Math.max(...data.map(({doc_count}) => doc_count)), [data])

    const handleFilter = () => {
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
    }

    return !data ? null : (
        <Box>
            <Typography variant="h6" className={classes.histogramTitle}>
                {title}
            </Typography>
            <FormControl margin="normal" style={{ width: '100%', height }}>
                {aggregationsLoading && !filterChanging ? <Loading/> :
                    <Grid container alignItems="flex-end" wrap="nowrap">
                        {data.map((item, index) =>
                            <Tooltip
                                key={index}
                                title={<>{item.label}: <strong>{formatThousands(item.doc_count)}</strong></>}
                                placement="top"
                            >
                                <Grid
                                    item
                                    key={item.value}
                                    className={classes.bar}
                                    style={{
                                        height: height * Math.log(item.doc_count + 1) / Math.log(maxCount + 1),
                                        backgroundColor: query.filters?.[field]?.intervals?.include?.includes(item.value) ?
                                            theme.palette.secondary.main : undefined
                                    }}
                                    component={ButtonBase}
                                    onClick={aggregationsLoading ? null : handleBarClick(item.value)}
                                />
                            </Tooltip>
                        )}
                    </Grid>
                }
            </FormControl>
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
