import { cloneElement } from 'react'
import Highlighter from 'react-highlight-words'

import { FileTypeDisplayLabelProps } from './types'

export const FileTypeDisplayLabel = ({ icon, bucket, quickFilter }: FileTypeDisplayLabelProps) => (
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
