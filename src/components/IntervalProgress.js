import React, { useEffect, useState } from 'react'
import { LinearProgress } from '@mui/material'

export default function IntervalProgress({ classes, eta }) {
    const [initialTime, setInitialTime] = useState(Date.now())
    const [value, setValue] = useState(0)
    useEffect(() => {
        setInitialTime(Date.now())
        setValue(5)
        const interval = setInterval(() => {
            const elapsedMs = Date.now() - initialTime
            setValue(v => Math.min(Math.max(v, (elapsedMs / (eta * 10))), 100))
        }, 200)

        return () => {
            clearInterval(interval)
        }
    }, [eta, initialTime])

    return (
        <LinearProgress
            className={classes.progress}
            classes={{ root: classes.progressRoot }}
            variant="determinate"
            value={value}
        />
    )
}
