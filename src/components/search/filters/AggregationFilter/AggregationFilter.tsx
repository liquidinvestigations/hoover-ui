import { Button, Checkbox, CircularProgress, Divider, Fade, Grid, List, ListItem, ListItemText, Typography } from '@mui/material'
import { T, useTranslate } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { FC, ReactElement } from 'react'

import { aggregationFields } from '../../../../constants/aggregationFields'
import { formatThousands } from '../../../../utils/utils'
import { ThinProgress } from '../../../common/ThinProgress/ThinProgress'
import { useSharedStore } from '../../../SharedStoreProvider'
import { AggregationFilterBucket } from '../AggregationFilterBucket/AggregationFilterBucket'
import { MoreButton } from '../MoreButton/MoreButton'
import { Pagination } from '../Pagination/Pagination'

import { useStyles } from './AggregationFilter.styles'

import type { AggregationValues, Bucket, SourceField, Terms } from '../../../../Types'

interface AggregationFilterProps {
    field: SourceField
    queryFilter?: Terms
    queryFacets?: number
    aggregations?: AggregationValues
    loading: boolean
    onChange: (field: SourceField, value: SourceField, triState?: boolean) => () => void
    triState?: boolean
    bucketLabel?: (bucket: Bucket) => ReactElement | string
    bucketSubLabel?: (bucket: Bucket) => ReactElement | string
    bucketValue?: (bucket: Bucket) => string
    quickFilter?: string
}

export const AggregationFilter: FC<AggregationFilterProps> = observer(
    ({ field, queryFilter, queryFacets, aggregations, loading, onChange, triState = false, bucketLabel, bucketSubLabel, bucketValue, quickFilter }) => {
        const { t } = useTranslate()
        const { classes, cx } = useStyles()
        const {
            filtersStore: { handleMissingChange, handleReset },
            searchMissingStore: { missing, missingLoading, missingLoadingETA },
        } = useSharedStore().searchStore

        const disableReset = loading || (!queryFilter?.include?.length && !queryFilter?.exclude?.length && !queryFilter?.missing && !queryFacets)

        return (
            <List dense disablePadding>
                <ListItem role={undefined} dense button onClick={handleMissingChange(field)}>
                    <Checkbox
                        size="small"
                        tabIndex={-1}
                        disableRipple
                        checked={Boolean(queryFilter?.missing)}
                        indeterminate={queryFilter?.missing === 'false'}
                        classes={{ root: classes.checkbox }}
                        disabled={loading}
                    />

                    <ListItemText
                        primary={t('missing_buckets', 'N/A')}
                        className={cx(classes.label, classes.italic, classes.empty)}
                        secondaryTypographyProps={{
                            className: classes.subLabel,
                        }}
                    />

                    <ListItemText
                        primary={
                            missingLoading === 0 ? (
                                <Typography variant="caption" className={classes.empty}>
                                    {formatThousands(missing?.[`${field}-missing`] || 0)}
                                </Typography>
                            ) : (
                                <Fade in={missingLoading > 0} unmountOnExit>
                                    <div>
                                        <ThinProgress eta={missingLoadingETA} />
                                        <CircularProgress size={18} thickness={5} className={classes.loading} />
                                    </div>
                                </Fade>
                            )
                        }
                        disableTypography
                        className={classes.docCount}
                    />
                </ListItem>

                <Divider />

                {aggregations?.buckets
                    ?.filter((bucket) => {
                        const label = bucketLabel ? bucketLabel(bucket) : bucket.key_as_string || bucket.key
                        return !quickFilter || (label as string).includes(quickFilter)
                    })
                    .map((bucket) => (
                        <AggregationFilterBucket
                            key={bucket.key}
                            field={field}
                            queryFilter={queryFilter}
                            bucket={bucket}
                            loading={loading}
                            onChange={onChange}
                            triState={triState}
                            bucketLabel={bucketLabel}
                            bucketSubLabel={bucketSubLabel}
                            bucketValue={bucketValue}
                            quickFilter={quickFilter}
                        />
                    ))}

                <ListItem dense>
                    <Grid container alignItems="center" justifyContent="space-between">
                        <Grid item>
                            {!aggregationFields[field]?.buckets &&
                                (aggregationFields[field]?.type === 'date' ? <Pagination field={field} /> : <MoreButton field={field} />)}
                        </Grid>
                        <Grid item>
                            <Button size="small" variant="text" disabled={disableReset} onClick={handleReset(field)}>
                                <T keyName="reset">Reset</T>
                            </Button>
                        </Grid>
                    </Grid>
                </ListItem>
            </List>
        )
    },
)
