import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { CircularProgress, LinearProgress } from '@material-ui/core'
import useLoading from '../hooks/useLoading'

const useStyles = makeStyles(theme => ({
    linear: {
        position: 'fixed',
        top: 0,
        height: 5,
        width: '100%',
        zIndex: theme.zIndex.appBar + 1,
    },
    circular: {
        position: 'fixed',
        top: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
}))

const getIndicator = type => {
    if (type === 'circular') {
        return <CircularProgress color="secondary" size={20} />;
    } else {
        return <LinearProgress color="secondary" variant="query" />;
    }
}

function ProgressIndicator({ type }) {
    const classes = useStyles()
    const loading = useLoading()

    return (
        <div className={classes[type]}>
            {loading && getIndicator(type)}
        </div>
    )
}

export default memo(ProgressIndicator)
