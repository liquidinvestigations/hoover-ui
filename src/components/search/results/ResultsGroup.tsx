import { Box, Fade, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { useSharedStore } from '../../SharedStoreProvider'
import { ResultsProgress } from '../ResultsProgress'

import { ResultsList } from './list/ResultsList'
import { ResultsTable } from './table/ResultsTable/ResultsTable'

interface ResultsProps {
    collection: string
}

export const ResultsGroup: FC<ResultsProps> = observer(({ collection }) => {
    const {
        searchViewStore: { resultsViewType },
        searchResultsStore: { resultsQueryTasks },
    } = useSharedStore().searchStore

    const queryTask = resultsQueryTasks[collection]

    let loadingETA = Number.MAX_SAFE_INTEGER

    if (queryTask.data) {
        if (queryTask.data?.status === 'done') {
            loadingETA = 0
        } else if (queryTask.data.eta.total_sec || 0 / (queryTask.initialEta || 1) < 1) {
            loadingETA = Math.min(queryTask.initialEta || 0, queryTask.data.eta.total_sec || 0)
        }
    }

    return (
        <>
            <hr />

            <h2>{collection}</h2>

            <Fade in={queryTask.data?.status === 'pending'} unmountOnExit>
                <Box display="flex" alignItems="center">
                    <Box width="100%" mr={1}>
                        <ResultsProgress eta={loadingETA} />
                    </Box>
                    <Box minWidth={35}>
                        {queryTask.data?.eta && (
                            <Typography variant="body2" color="textSecondary">
                                ETA:&nbsp;{queryTask.data.eta.total_sec}s
                            </Typography>
                        )}
                    </Box>
                </Box>
            </Fade>

            {resultsViewType === 'list' ? <ResultsList queryTask={queryTask} /> : <ResultsTable queryTask={queryTask} />}
        </>
    )
})
