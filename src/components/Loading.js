import { memo } from 'react'
import { makeStyles } from '@mui/styles'
import { CircularProgress } from '@mui/material'

const useStyles = makeStyles((theme) => ({
    progress: {
        padding: '1rem',
        textAlign: 'center',
    },
}))

function Loading(props) {
    const classes = useStyles()

    return (
        <div className={classes.progress}>
            <CircularProgress {...props} />
        </div>
    )
}

export default memo(Loading)
