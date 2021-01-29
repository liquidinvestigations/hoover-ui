import React, { createContext, memo, useContext, useState } from 'react'
import { CircularProgress, LinearProgress } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

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
        return <CircularProgress color="secondary" size={20} />
    } else {
        return <LinearProgress color="secondary" variant="query" />
    }
}

const ProgressIndicatorContext = createContext({})

function ProgressIndicator({ type }) {
    const classes = useStyles()
    const { loading } = useProgressIndicator()

    return (
        <div className={classes[type]}>
            {loading && getIndicator(type)}
        </div>
    )
}

export function ProgressIndicatorProvider({ children }) {
    const [loading, setLoading] = useState(false)

    return (
        <ProgressIndicatorContext.Provider value={{ loading, setLoading }}>
            {children}
        </ProgressIndicatorContext.Provider>
    )
}

export const useProgressIndicator = () => useContext(ProgressIndicatorContext)

export default memo(ProgressIndicator)
