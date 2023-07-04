import { Grid, ListItem, ListItemText, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { Hits } from '../../../../Types'
import { formatThousands } from '../../../../utils/utils'
import { Expandable } from '../../../common/Expandable/Expandable'
import { useSharedStore } from '../../../SharedStoreProvider'
import { ResultsList } from '../resultsList/ResultsList'
import { ResultsTable } from '../resultsTable/ResultsTable/ResultsTable'

interface ResultsProps {
    collection: string
    hits?: Hits
}

export const ResultsGroup: FC<ResultsProps> = observer(({ collection, hits }) => {
    const {
        searchViewStore: { resultsViewType },
        searchResultsStore: { results, resultsLoadingETA },
    } = useSharedStore().searchStore

    return (
        <Expandable
            defaultOpen
            contentVisible={hits && hits.total > 0}
            highlight={false}
            title={collection}
            summary={
                <Typography variant="caption" display="block">
                    {hits && `${formatThousands(hits.total)} result${hits.total === 1 ? '' : 's'}`}
                </Typography>
            }
            loading={!!resultsLoadingETA[collection]}
            loadingETA={resultsLoadingETA[collection]}>
            {resultsViewType === 'list' ? <ResultsList hits={hits} /> : <ResultsTable hits={hits} />}
        </Expandable>
    )
})
