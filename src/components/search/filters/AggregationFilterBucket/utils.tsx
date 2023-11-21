import { ReactElement, cloneElement } from 'react'
import Highlighter from 'react-highlight-words'

import { Bucket, SourceField } from '../../../../Types'
import { getTagIcon, getTypeIcon } from '../../../../utils/utils'

export const getTagsDisplayLabel = (icon: ReactElement, bucket: Bucket, quickFilter?: string) => (
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
        <span>{!quickFilter?.length ? bucket.key : <Highlighter searchWords={[quickFilter]} autoEscape={true} textToHighlight={bucket.key} />}</span>
    </>
)

export const getFileTypeDisplayLabel = (icon: ReactElement, bucket: Bucket, quickFilter?: string) => (
    <>
        {!!icon &&
            cloneElement(icon, {
                style: {
                    marginRight: 6,
                    fontSize: 17,
                    color: '#757575',
                },
            })}
        <span>{!quickFilter?.length ? bucket.key : <Highlighter searchWords={[quickFilter]} autoEscape={true} textToHighlight={bucket.key} />}</span>
    </>
)

export const getValue = (bucketValue: ((bucket: Bucket) => string) | undefined, bucket: Bucket) =>
    bucketValue ? (bucketValue(bucket) as SourceField) : (bucket.key_as_string as SourceField) || (bucket.key as SourceField)

export const getLabel = (bucketLabel: ((bucket: Bucket) => ReactElement | string) | undefined, bucket: Bucket) =>
    bucketLabel ? (bucketLabel(bucket) as string) : bucket.key_as_string || bucket.key

export const getDisplayLabel = (label: string, field: SourceField, bucket: Bucket, excluded?: boolean, quickFilter?: string) => {
    let icon = getTagIcon(bucket.key, field === 'tags', excluded)
    if ((field === 'tags' || field === 'priv-tags') && icon) {
        return getTagsDisplayLabel(icon, bucket, quickFilter)
    }

    if (field === 'filetype' && (icon = getTypeIcon(bucket.key))) {
        return getFileTypeDisplayLabel(icon, bucket, quickFilter)
    }

    return !quickFilter?.length ? label : <Highlighter searchWords={[quickFilter]} autoEscape={true} textToHighlight={label} />
}
