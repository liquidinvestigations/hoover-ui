import { cloneElement } from 'react'
import Highlighter from 'react-highlight-words'

import { TagDisplayLabelProps } from './types'

export const TagDisplayLabel = ({ icon, bucket, quickFilter }: TagDisplayLabelProps) => (
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
