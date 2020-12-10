import React, { memo } from 'react'
import cn from 'classnames'
import { makeStyles } from '@material-ui/core/styles'
import { Button, Checkbox, Grid, List, ListItem, ListItemText, ListSubheader, Typography } from '@material-ui/core'
import { formatThousands } from '../../utils'

const defaultBucketSorter = (a, b) => b.doc_count - a.doc_count;

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

function AggregationFilter({ aggregation, cardinality, size, title, disabled, onChange, onLoadMore,
                               selected, bucketLabel, bucketSubLabel, bucketValue, sortBuckets }) {

    const classes = useStyles()

    const handleChange = value => () => {
        const selection = new Set(selected || [])

        if (selection.has(value)) {
            selection.delete(value)
        } else {
            selection.add(value)
        }

        onChange(Array.from(selection))
    }

    const reset = () => onChange([])

    const buckets = (aggregation && aggregation.buckets
        ? aggregation.buckets
        : []
    ).sort(sortBuckets || defaultBucketSorter)

    if (!buckets.length) {
        return null
    }

    const renderBucket = bucket => {
        const label = bucketLabel ? bucketLabel(bucket) : bucket.key
        const subLabel = bucketSubLabel ? bucketSubLabel(bucket) : null
        const value = bucketValue ? bucketValue(bucket) : bucket.key
        const checked = selected?.includes(value) || false

        if (!checked && !bucket.doc_count) {
            return null
        }

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

    return (
        <List subheader={title ? <ListSubheader>{title}</ListSubheader> : null}>
            {buckets.map(renderBucket).filter(Boolean)}

            <ListItem dense>
                <Grid container alignItems="center" justify="space-between">
                    <Grid item>
                        {onLoadMore &&
                        cardinality &&
                        size &&
                        cardinality.value > size ? (
                            <Button
                                size="small"
                                disabled={disabled}
                                variant="text"
                                onClick={onLoadMore}>
                                More ({cardinality.value - size})
                            </Button>
                        ) : null}
                    </Grid>

                    <Grid item>
                        <Button
                            size="small"
                            variant="text"
                            disabled={disabled || !selected?.length}
                            onClick={reset}>
                            Reset
                        </Button>
                    </Grid>
                </Grid>
            </ListItem>
        </List>
    )
}

export default memo(AggregationFilter)
