import { CircularProgress, LinearProgress } from '@mui/material'
import { FC } from 'react'

import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './ProgressIndicator.styles'

type ProgressIndicatorType = 'circular' | 'linear'

interface ProgressIndicatorProps {
    type: ProgressIndicatorType
}

const getIndicator = (type: ProgressIndicatorType) => {
    if (type === 'circular') {
        return <CircularProgress color="secondary" size={20} />
    } else {
        return <LinearProgress color="secondary" variant="query" />
    }
}

export const ProgressIndicator: FC<ProgressIndicatorProps> = ({ type }) => {
    const { classes } = useStyles()
    const {
        searchStore: {
            searchResultsStore: { resultsLoadingETA },
        },
    } = useSharedStore()

    return <div className={classes[type]}>{!!Object.keys(resultsLoadingETA).length && getIndicator(type)}</div>
}
