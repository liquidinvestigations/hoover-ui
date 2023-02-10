import { Button, Checkbox, CircularProgress, Divider, Fade, Grid, List, ListItem, ListItemText, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import cn from 'classnames'
import { cloneElement, memo } from 'react'
import isEqual from 'react-fast-compare'
import Highlighter from 'react-highlight-words'

import { aggregationFields } from '../../../constants/aggregationFields'
import { formatThousands, getTagIcon, getTypeIcon } from '../../../utils/utils'
import ThinProgress from '../ThinProgress'

import MoreButton from './MoreButton'
import Pagination from './Pagination'

const useStyles = makeStyles((theme) => ({
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
    italic: {
        fontStyle: 'italic',
    },
    empty: {
        color: theme.palette.grey[500],
    },
    subLabel: {
        fontSize: '8.5pt',
    },
    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },
    docCount: {
        flex: '1 0 auto',
        paddingLeft: 6,
    },
}))

function AggregationFilter({
    field,
    queryFilter,
    queryFacets,
    aggregations,
    loading,
    missing,
    missingLoading,
    missingLoadingETA,
    onChange,
    triState,
    bucketLabel,
    bucketSubLabel,
    bucketValue,
    search,
}) {
    const classes = useStyles()
    const aggregation = aggregations?.values

    const handleChange = (value) => () => {
        const include = new Set(queryFilter?.include || [])
        const exclude = new Set(queryFilter?.exclude || [])

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
            ...queryFilter,
            include: Array.from(include),
            exclude: Array.from(exclude),
        })
    }

    const handleMissingChange = () => {
        if (queryFilter?.missing === 'true') {
            onChange(field, {
                ...queryFilter,
                missing: 'false',
            })
        } else if (queryFilter?.missing === 'false') {
            onChange(field, {
                ...queryFilter,
                missing: undefined,
            })
        } else {
            onChange(field, {
                ...queryFilter,
                missing: 'true',
            })
        }
    }

    const handleReset = () => onChange(field, [], true)

    const renderBucket = (bucket, handler = handleChange, italic = false) => {
        const label = bucketLabel ? bucketLabel(bucket) : bucket.key_as_string || bucket.key
        const subLabel = bucketSubLabel ? bucketSubLabel(bucket) : null
        const value = bucketValue ? bucketValue(bucket) : bucket.key_as_string || bucket.key
        const included = queryFilter?.include?.includes(value)
        const excluded = queryFilter?.exclude?.includes(value)
        const checked = included || excluded || false

        if (!label.includes(search)) {
            return false
        }

        let displayLabel = !search.length ? label : <Highlighter searchWords={[search]} autoEscape={true} textToHighlight={label} />,
            icon

        if ((field === 'tags' || field === 'priv-tags') && (icon = getTagIcon(bucket.key, field === 'tags', excluded))) {
            displayLabel = (
                <>
                    {!!icon &&
                        cloneElement(icon, {
                            style: {
                                ...icon.props.style,
                                marginTop: 3,
                                marginBottom: -3,
                                marginRight: 6,
                                fontSize: 17,
                            },
                        })}
                    <span>{!search.length ? bucket.key : <Highlighter searchWords={[search]} autoEscape={true} textToHighlight={bucket.key} />}</span>
                </>
            )
        }

        if (field === 'filetype' && (icon = getTypeIcon(bucket.key))) {
            displayLabel = (
                <>
                    {!!icon &&
                        cloneElement(icon, {
                            style: {
                                marginRight: 6,
                                fontSize: 17,
                                color: '#757575',
                            },
                        })}
                    <span>{!search.length ? bucket.key : <Highlighter searchWords={[search]} autoEscape={true} textToHighlight={bucket.key} />}</span>
                </>
            )
        }

        return (
            <ListItem key={bucket.key} role={undefined} dense button onClick={handler(value)}>
                <Checkbox
                    size="small"
                    tabIndex={-1}
                    disableRipple
                    value={value}
                    checked={checked}
                    indeterminate={triState && excluded}
                    classes={{ root: classes.checkbox }}
                    disabled={loading || !bucket.doc_count}
                    onChange={handler(value)}
                />

                <ListItemText
                    primary={displayLabel}
                    secondary={subLabel}
                    className={cn({ [classes.labelWithSub]: subLabel, [classes.italic]: italic })}
                    primaryTypographyProps={{
                        className: classes.label,
                    }}
                    secondaryTypographyProps={{
                        className: classes.subLabel,
                    }}
                />

                <ListItemText
                    primary={<Typography variant="caption">{formatThousands(bucket.doc_count)}</Typography>}
                    className={classes.docCount}
                    disableTypography
                    align="right"
                />
            </ListItem>
        )
    }

    const disableReset = loading || (!queryFilter?.include?.length && !queryFilter?.exclude?.length && !queryFilter?.missing && !queryFacets)

    return (
        <List dense disablePadding>
            <ListItem role={undefined} dense button onClick={handleMissingChange}>
                <Checkbox
                    size="small"
                    tabIndex={-1}
                    disableRipple
                    checked={!!queryFilter?.missing}
                    indeterminate={queryFilter?.missing === 'false'}
                    classes={{ root: classes.checkbox }}
                    disabled={loading}
                    onChange={handleMissingChange}
                />

                <ListItemText
                    primary="N/A"
                    className={cn(classes.label, classes.italic, classes.empty)}
                    secondaryTypographyProps={{
                        className: classes.subLabel,
                    }}
                />

                <ListItemText
                    primary={
                        !!missing?.values ? (
                            <Typography variant="caption" className={classes.empty}>
                                {formatThousands(missing?.values.doc_count)}
                            </Typography>
                        ) : (
                            <Fade in={missingLoading} unmountOnExit>
                                <div>
                                    <ThinProgress eta={missingLoadingETA} loading={missingLoading} />
                                    <CircularProgress size={18} thickness={5} className={classes.loading} />
                                </div>
                            </Fade>
                        )
                    }
                    disableTypography
                    align="right"
                />
            </ListItem>

            <Divider />

            {aggregation?.buckets.map((bucket) => renderBucket(bucket)).filter(Boolean)}

            <ListItem dense>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        {!aggregationFields[field].buckets &&
                            (aggregationFields[field].type === 'date' ? <Pagination field={field} /> : <MoreButton field={field} />)}
                    </Grid>
                    <Grid item>
                        <Button size="small" variant="text" disabled={disableReset} onClick={handleReset}>
                            Reset
                        </Button>
                    </Grid>
                </Grid>
            </ListItem>
        </List>
    )
}

export default memo(AggregationFilter, isEqual)
