import { FC } from 'react'

import { useStyles } from './Text.styles'

export const Text: FC<{ content: string }> = ({ content }) => {
    const { classes } = useStyles()

    return !content ? <i>No text</i> : <pre className={classes.preWrap} dangerouslySetInnerHTML={{ __html: content.trim() }} />
}
