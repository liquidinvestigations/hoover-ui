import { Checkbox, ListItem, ListItemText, Typography } from '@mui/material'
import { FC, ReactElement } from 'react'

import { Bucket, SourceField, Terms } from '../../../../Types'
import { formatThousands } from '../../../../utils/utils'

import { useStyles } from './AggregationFilterBucket.styles'
import { DisplayLabel } from './Labels/DisplayLabel'
import { getLabel, getValue } from './utils'

interface AggregationFilterBucketProps {
    field: SourceField
    queryFilter?: Terms
    bucket: Bucket
    loading: boolean
    onChange: (field: SourceField, value: SourceField, triState?: boolean) => () => void
    triState?: boolean
    bucketLabel?: (bucket: Bucket) => ReactElement | string
    bucketSubLabel?: (bucket: Bucket) => ReactElement | string
    bucketValue?: (bucket: Bucket) => string
    quickFilter?: string
}

export const AggregationFilterBucket: FC<AggregationFilterBucketProps> = ({
    field,
    queryFilter,
    bucket,
    loading,
    onChange,
    triState,
    bucketLabel,
    bucketSubLabel,
    bucketValue,
    quickFilter,
}) => {
    const { classes, cx } = useStyles()

    const label = getLabel(bucketLabel, bucket)
    const subLabel = bucketSubLabel ? bucketSubLabel(bucket) : undefined
    const value = getValue(bucketValue, bucket)
    const included = queryFilter?.include?.includes(value)
    const excluded = queryFilter?.exclude?.includes(value)
    const checked = included || excluded || false

    return (
        <ListItem key={bucket.key} role={undefined} dense button onClick={onChange(field, value, triState)}>
            <Checkbox
                size="small"
                tabIndex={-1}
                disableRipple
                value={value}
                checked={checked}
                indeterminate={triState && excluded}
                classes={{ root: classes.checkbox }}
                disabled={loading || !bucket.doc_count}
            />

            <ListItemText
                primary={<DisplayLabel label={label} field={field} bucket={bucket} excluded={excluded} quickFilter={quickFilter} />}
                secondary={subLabel}
                className={cx({ [classes.labelWithSub]: !!subLabel })}
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
            />
        </ListItem>
    )
}
