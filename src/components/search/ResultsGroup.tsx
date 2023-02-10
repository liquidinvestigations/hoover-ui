import { Box, Fade, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { useSharedStore } from '../SharedStoreProvider'

import { Pagination } from './Pagination'
import { ResultsList } from './ResultsList'
import ResultsProgress from './ResultsProgress'
import { ResultsTable } from './ResultsTable'

interface ResultsProps {
    collection: string
}

export const ResultsGroup: FC<ResultsProps> = observer(({ collection }) => {
    const {
        searchResultsStore: { resultsQueryTasks, viewType },
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

            {!!queryTask.data?.result?.hits.hits.length && <Pagination collection={collection} />}

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

            {viewType === 'list' ? <ResultsList queryTask={queryTask} /> : <ResultsTable queryTask={queryTask} />}

            {!!queryTask.data?.result?.hits.hits.length && <Pagination collection={collection} />}
        </>
    )
})
