import React from 'react'
import { makeStyles } from '@mui/styles'
import IntervalProgress from '../IntervalProgress'

const useStyles = makeStyles(theme => ({
    progress: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
    },
    progressRoot: {
        height: 1,
    },
}))

export default function ThinProgress({ eta }) {
    const classes = useStyles()

    return <IntervalProgress classes={classes} eta={eta} />
}
