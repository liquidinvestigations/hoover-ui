import Highlighter from 'react-highlight-words'

import { getTagIcon, getTypeIcon } from '../../../../../utils/utils'

import { FileTypeDisplayLabel } from './FileTypeDisplayLabel'
import { TagDisplayLabel } from './TagDisplayLabel'
import { DisplayLabelProps } from './types'

export const DisplayLabel = ({ label, field, bucket, excluded, quickFilter }: DisplayLabelProps): JSX.Element => {
    let icon = getTagIcon(bucket.key, field === 'tags', excluded)
    if ((field === 'tags' || field === 'priv-tags') && icon) {
        return <TagDisplayLabel icon={icon} bucket={bucket} quickFilter={quickFilter} />
    }

    if (field === 'filetype' && (icon = getTypeIcon(bucket.key))) {
        return <FileTypeDisplayLabel icon={icon} bucket={bucket} quickFilter={quickFilter} />
    }

    return !quickFilter?.length ? <>{label}</> : <Highlighter searchWords={[quickFilter]} autoEscape={true} textToHighlight={label} />
}
