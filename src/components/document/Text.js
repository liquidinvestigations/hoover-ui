import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles({
    preWrap: {
        whiteSpace: 'pre-wrap'
    },
})

function Text({ content }) {
    const classes = useStyles()

    return !content ?
        <i> (empty) </i> :
        <pre className={classes.preWrap}>{content.trim()}</pre>
}

export default memo(Text)
