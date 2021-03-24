import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { useTextSearch } from './TextSearchProvider'

const useStyles = makeStyles({
    preWrap: {
        whiteSpace: 'pre-wrap'
    },
})

function Text({ content }) {
    const classes = useStyles()
    const { highlight } = useTextSearch()

    return !content ?
        <i>No text</i> :
        <pre className={classes.preWrap}>{highlight(content.trim())}</pre>
}

export default memo(Text)
