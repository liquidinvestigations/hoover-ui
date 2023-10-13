import { Checkbox, ListItem, ListItemText, Typography } from '@mui/material'
import { cloneElement, FC, ReactElement } from 'react'
import Highlighter from 'react-highlight-words'

import { Bucket, SourceField, Terms } from '../../../../Types'
import { formatThousands, getTagIcon, getTypeIcon } from '../../../../utils/utils'

import { useStyles } from './AggregationFilterBucket.styles'

interface AggregationFilterBucketProps {
    field: SourceField
    queryFilter?: Terms
    bucket: Bucket
    loading: boolean
    onChange: (field: SourceField, value: string, triState?: boolean) => () => void
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

    const label = bucketLabel ? (bucketLabel(bucket) as string) : bucket.key_as_string || bucket.key
    const subLabel = bucketSubLabel ? bucketSubLabel(bucket) : undefined
    const value = bucketValue ? (bucketValue(bucket) as SourceField) : (bucket.key_as_string as SourceField) || (bucket.key as SourceField)
    const included = queryFilter?.include?.includes(value)
    const excluded = queryFilter?.exclude?.includes(value)
    const checked = included || excluded || false

    let displayLabel = !quickFilter?.length ? label : <Highlighter searchWords={[quickFilter]} autoEscape={true} textToHighlight={label} />,
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
                <span>
                    {!quickFilter?.length ? bucket.key : <Highlighter searchWords={[quickFilter]} autoEscape={true} textToHighlight={bucket.key} />}
                </span>
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
                <span>
                    {!quickFilter?.length ? bucket.key : <Highlighter searchWords={[quickFilter]} autoEscape={true} textToHighlight={bucket.key} />}
                </span>
            </>
        )
    }

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
                primary={displayLabel}
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
