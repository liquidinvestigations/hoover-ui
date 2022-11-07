import React, { memo } from 'react'
import { makeStyles } from '@mui/styles'

const useStyles = makeStyles({
    preWrap: {
        whiteSpace: 'pre-wrap'
    },
})

export const Text = ({ content }) => {
    const classes = useStyles()

    return !content ?
        <i>No text</i> :
        <pre className={classes.preWrap}>{content.trim()}</pre>
}
