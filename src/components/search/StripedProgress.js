import { makeStyles } from '@material-ui/core/styles'
import { LinearProgress } from '@material-ui/core'
import React from 'react'

const useStyles = makeStyles(theme => ({
    progress: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
    },
    progressRoot: {
        backgroundImage: `linear-gradient(
            -45deg,
            rgba(255, 255, 255, .5) 25%,
            transparent 25%,
            transparent 50%,
            rgba(255, 255, 255, .5) 50%,
            rgba(255, 255, 255, .5) 75%,
            transparent 75%,
            transparent
        )`,
        backgroundSize: '10px 10px',
        animation: '$move 1s linear infinite',
    },
    '@keyframes move': {
        '0%': {
            backgroundPosition: '0 0',
        },
        '100%': {
            backgroundPosition: '10px 10px',
        }
    }
}))

export default function StripedProgress({ value }) {
    const classes = useStyles()

    return (
        <LinearProgress
            className={classes.progress}
            variant="determinate"
            value={value}
            classes={{ root: classes.progressRoot }}
        />
    )
}
