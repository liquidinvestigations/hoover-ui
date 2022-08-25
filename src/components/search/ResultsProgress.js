import React from 'react'
import { makeStyles } from '@mui/styles'
import IntervalProgress from '../IntervalProgress'

const useStyles = makeStyles(theme => ({
    progress: {
        height: 20,
        borderRadius: 5,
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(3),
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
        backgroundSize: '50px 50px',
        animation: '$move 2s linear infinite',
    },
    '@keyframes move': {
        '0%': {
            backgroundPosition: '0 0',
        },
        '100%': {
            backgroundPosition: '50px 50px',
        }
    }
}))

export default function ResultsProgress({ eta }) {
    const classes = useStyles()

    return <IntervalProgress classes={classes} eta={eta} />
}
