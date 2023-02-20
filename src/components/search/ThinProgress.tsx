import { makeStyles } from '@mui/styles'
import { FC } from 'react'

import IntervalProgress from '../IntervalProgress'

const useStyles = makeStyles(() => ({
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

export const ThinProgress: FC<{ eta: number }> = ({ eta }) => {
    const classes = useStyles()

    return <IntervalProgress classes={classes} eta={eta} />
}
