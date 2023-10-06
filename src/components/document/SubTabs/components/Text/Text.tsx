import { T } from '@tolgee/react'
import { FC } from 'react'

import { useStyles } from './Text.styles'

export const Text: FC<{ content: string }> = ({ content }) => {
    const { classes } = useStyles()

    return !content ? (
        <i>
            <T keyName="no_text">No text</T>
        </i>
    ) : (
        <pre className={classes.preWrap} dangerouslySetInnerHTML={{ __html: content.trim() }} />
    )
}
