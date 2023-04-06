import { CircularProgress } from '@mui/material'
import { CircularProgressProps } from '@mui/material/CircularProgress/CircularProgress'
import { FC, memo } from 'react'

import { useStyles } from './Loading.styles'

export const Loading: FC<CircularProgressProps> = (props) => {
    const { classes } = useStyles()

    return (
        <div className={classes.progress}>
            <CircularProgress {...props} />
        </div>
    )
}
