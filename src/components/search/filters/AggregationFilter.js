import React, { memo } from 'react'
import cn from 'classnames'
import isEqual from 'react-fast-compare'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Checkbox, Grid, IconButton, List, ListItem, ListItemText, Typography } from '@material-ui/core'
import { formatThousands } from '../../../utils'
import { DEFAULT_FACET_SIZE } from '../../../constants'
import { NavigateBefore, NavigateNext } from '@material-ui/icons'

const useStyles = makeStyles(theme => ({
    checkbox: {
        padding: 5,
    },
    label: {
        overflowX: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
    labelWithSub: {
        margin: 0,
    },
    subLabel: {
        fontSize: '8.5pt',
    },
}))

function AggregationFilter({ field, queryFilter, queryFilterField, queryFacets, aggregations,
                               disabled, onChange, onPagination, onLoadMore, triState,
                               bucketLabel, bucketSubLabel, bucketValue }) {

    const classes = useStyles()

    const aggregation = aggregations?.values
    const cardinality = aggregations?.count
    const selected = queryFilterField ? queryFilter?.[queryFilterField] : queryFilter

    const pageParam = parseInt(queryFacets?.[field])
    const page = isNaN(pageParam) ? 1 : pageParam

    const handleChange = value => () => {
        const include = new Set(selection?.include || [])
        const exclude = new Set(selection?.exclude || [])

        if (include.has(value)) {
            include.delete(value)
            if (triState) {
                exclude.add(value)
            }
        } else if (exclude.has(value)) {
            exclude.delete(value)
        } else {
            include.add(value)
        }

        onChange(field, {
            include: Array.from(include),
            exclude: Array.from(exclude),
        })
    }

    const handleReset = () => onChange(field, [], true)

    const handlePrev = () => onPagination(field, page - 1)
    const handleNext = () => onPagination(field, page + 1)
    const handleLoadMore = () => onLoadMore(field, page + 1)

    const renderBucket = bucket => {
        const label = bucketLabel ? bucketLabel(bucket) : bucket.key
        const subLabel = bucketSubLabel ? bucketSubLabel(bucket) : null
        const value = bucketValue ? bucketValue(bucket) : bucket.key
        const checked = selection?.include?.includes(value) ||
            selection?.exclude?.includes(value) || false

        return (
            <ListItem
                key={bucket.key}
                role={undefined}
                dense
                button
                onClick={handleChange(value)}
            >
                <Checkbox
                    size="small"
                    tabIndex={-1}
                    disableRipple
                    value={value}
                    checked={checked}
                    indeterminate={triState && selection?.exclude?.includes(value)}
                    classes={{ root: classes.checkbox }}
                    disabled={disabled || !bucket.doc_count}
                    onChange={handleChange(value)}
                />

                <ListItemText
                    primary={label}
                    secondary={subLabel}
                    className={cn(classes.label, {[classes.labelWithSub]: subLabel})}
                    secondaryTypographyProps={{
                        className: classes.subLabel
                    }}
                />

                <ListItemText
                    primary={
                        <Typography variant="caption">
                            {formatThousands(bucket.doc_count)}
                        </Typography>
                    }
                    disableTypography
                    align="right"
                />
            </ListItem>
        )
    }

    const hasNext = onPagination && aggregation?.buckets.length >= DEFAULT_FACET_SIZE
    const hasPrev = onPagination && page > 1
    const hasMore = onLoadMore && cardinality?.value > page * DEFAULT_FACET_SIZE
    const disableReset = disabled || (!selection?.include?.length && !selection?.exclude?.length && page === 1)

    return (
        <List dense>
            {aggregation?.buckets.map(renderBucket).filter(Boolean)}

            <ListItem dense>
                <Grid container alignItems="center" justify="space-between">
                    <Grid item>
                        {(hasPrev || hasNext) &&
                            <Grid container justify="flex-end">
                                <IconButton
                                    size="small"
                                    tabIndex="-1"
                                    onClick={handlePrev}
                                    disabled={disabled || !hasPrev}>
                                    <NavigateBefore/>
                                </IconButton>

                                <IconButton
                                    size="small"
                                    onClick={handleNext}
                                    disabled={disabled || !hasNext}>
                                    <NavigateNext/>
                                </IconButton>
                            </Grid>
                        }
                        {hasMore &&
                            <Button
                                size="small"
                                disabled={disabled}
                                variant="text"
                                onClick={handleLoadMore}>
                                More ({cardinality.value - page * DEFAULT_FACET_SIZE})
                            </Button>
                        }
                    </Grid>
                    <Grid item>
                        <Button
                            size="small"
                            variant="text"
                            disabled={disableReset}
                            onClick={handleReset}>
                            Reset
                        </Button>
                    </Grid>
                </Grid>
            </ListItem>
        </List>
    )
}

export default memo(AggregationFilter, isEqual)
