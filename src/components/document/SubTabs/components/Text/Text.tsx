import { T } from '@tolgee/react'
import { FC } from 'react'

import { useStyles } from './Text.styles'

export const Text: FC<{ content: string }> = ({ content }) => {
    const { classes } = useStyles()

    const escapeHtml = (unsafe: string) => {
        return unsafe.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#039;')
    }

    return !content ? (
        <i>
            <T keyName="no_text">No text</T>
        </i>
    ) : (
        <pre className={classes.preWrap} dangerouslySetInnerHTML={{ __html: escapeHtml(content).trim() }} />
    )
}
