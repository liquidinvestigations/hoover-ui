import React, { memo, useCallback, useMemo } from 'react'
import { DateTime } from 'luxon'
import { Box, ButtonBase, FormControl, Grid, Tooltip, Typography } from '@material-ui/core'
import { makeStyles, useTheme } from '@material-ui/core/styles'
import { blue } from '@material-ui/core/colors'
import { useSearch } from './SearchProvider'
import { formatsLabel, formatsValue } from './filters/DateHistogramFilter'
import { DEFAULT_INTERVAL } from '../../constants/general'
import { formatThousands } from '../../utils'

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
    const { aggregations, query, search } = useSearch()

    const interval = query.filters?.[field]?.interval || DEFAULT_INTERVAL

    const formatLabel = value => DateTime
        .fromISO(value, { setZone: true })
        .toFormat(formatsLabel[interval])

    const formatValue = value => DateTime
        .fromISO(value, { setZone: true })
        .toFormat(formatsValue[interval])

    const data = useMemo(() => {
        return aggregations?.[field].values.buckets.map(({doc_count, key_as_string}) => ({
            doc_count, label: formatLabel(key_as_string), value: formatValue(key_as_string)
        }))
    }, [aggregations, interval])

    const maxCount = useMemo(() => data && Math.max(...data.map(({doc_count}) => doc_count)), [data])

    const handleBarClick = useCallback(value => () => {
        const { [field]: prevFilter, ...restFilters } = query.filters || {}
        const { intervals, ...rest } = prevFilter || {}
        let newIntervals = null

        if (intervals?.include?.includes(value)){
            if (intervals.include.length > 1) {
                const newInclude = [...intervals.include]
                newInclude.splice(intervals.include.indexOf(value), 1)
                newIntervals = { include: newInclude }
            }
        } else if (intervals?.include?.length) {
            newIntervals = { include: [...intervals.include, value] }
        } else {
            newIntervals = { include: [value] }
        }

        if (newIntervals) {
            search({ filters: { [field]: { intervals: newIntervals, ...rest }, ...restFilters }, page: 1 })
        } else {
            search({ filters: { [field]: rest, ...restFilters }, page: 1 })
        }
    }, [query])

    return !data ? null : (
        <Box>
            <Typography variant="h6" className={classes.histogramTitle}>
                {title}
            </Typography>
            <FormControl margin="normal" style={{ width: '100%', height }}>
                <Grid container alignItems="flex-end">
                    {data.map(item =>
                        <Tooltip
                            title={
                                <>
                                    {item.label}: <strong>{formatThousands(item.doc_count)}</strong>
                                </>
                            }
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
                                onClick={handleBarClick(item.value)}
                            />
                        </Tooltip>
                    )}
                </Grid>
            </FormControl>
        </Box>
    )
}

export default memo(Histogram)
