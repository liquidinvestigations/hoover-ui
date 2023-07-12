import { LinearProgress } from '@mui/material'
import { FC, useEffect, useState } from 'react'

import { useStyles } from './ThinProgress.styles'

export const ThinProgress: FC<{ eta: number; height?: number }> = ({ eta, height = 1 }) => {
    const { classes } = useStyles()

    const [initialTime, setInitialTime] = useState(Date.now())
    const [value, setValue] = useState(0)
    useEffect(() => {
        setValue(5)
        const interval = setInterval(() => {
            const elapsedMs = Date.now() - initialTime
            setValue((v) => Math.min(Math.max(v, elapsedMs / (eta * 10)), 100))
        }, 200)

        return () => {
            clearInterval(interval)
        }
    }, [eta, initialTime])

    useEffect(() => {
        setInitialTime(Date.now())
    }, [eta])

    return <LinearProgress className={classes.progress} style={{ height }} variant="determinate" value={value} />
}
