import { ReactElement } from 'react'

import { Bucket, SourceField } from '../../../../Types'

export const getValue = (bucketValue: ((bucket: Bucket) => string) | undefined, bucket: Bucket) =>
    bucketValue ? (bucketValue(bucket) as SourceField) : (bucket.key_as_string as SourceField) || (bucket.key as SourceField)

export const getLabel = (bucketLabel: ((bucket: Bucket) => ReactElement | string) | undefined, bucket: Bucket) =>
    bucketLabel ? (bucketLabel(bucket) as string) : bucket.key_as_string || bucket.key
