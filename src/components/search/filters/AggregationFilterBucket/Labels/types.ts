import { ReactElement } from 'react'

import { Bucket, SourceField } from '../../../../../Types'

export type WithIcon = {
    icon: ReactElement
}

export type TagDisplayLabelProps = Omit<DisplayLabelProps, 'label' | 'field' | 'excluded'> & WithIcon

export type FileTypeDisplayLabelProps = TagDisplayLabelProps

export interface DisplayLabelProps {
    label: string
    field: SourceField
    bucket: Bucket
    excluded?: boolean
    quickFilter?: string
}
