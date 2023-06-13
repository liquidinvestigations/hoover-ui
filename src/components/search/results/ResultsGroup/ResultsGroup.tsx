import { Grid, ListItem, ListItemText, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { formatThousands } from '../../../../utils/utils'
import { Expandable } from '../../../common/Expandable/Expandable'
import { useSharedStore } from '../../../SharedStoreProvider'
import { ResultsList } from '../resultsList/ResultsList'
import { ResultsTable } from '../resultsTable/ResultsTable/ResultsTable'

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
        <Expandable
            defaultOpen
            contentVisible={queryTask.data?.result ? queryTask.data.result.hits.total > 0 : false}
            highlight={false}
            title={collection}
            summary={
                <Typography variant="caption" display="block">
                    {queryTask.data?.result
                        ? `${formatThousands(queryTask.data.result.hits.total)} result${queryTask.data.result.hits.total === 1 ? '' : 's'}`
                        : ''}
                </Typography>
            }
            loading={queryTask.data?.status === 'pending'}
            loadingETA={loadingETA}>
            {resultsViewType === 'list' ? <ResultsList queryTask={queryTask} /> : <ResultsTable queryTask={queryTask} />}
        </Expandable>
    )
})
