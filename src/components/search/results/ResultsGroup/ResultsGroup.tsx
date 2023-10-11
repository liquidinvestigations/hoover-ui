import { Typography } from '@mui/material'
import { T } from '@tolgee/react'
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
        searchResultsStore: { resultsLoadingETA },
    } = useSharedStore().searchStore

    return (
        <Expandable
            defaultOpen
            contentVisible={hits && hits.total > 0}
            highlight={false}
            title={collection}
            summary={
                <Typography variant="caption" display="block">
                    {hits && (
                        <T keyName="results_count" params={{ total: formatThousands(hits.total) }}>
                            {'{total} {total, plural, one {result} other {results}}'}
                        </T>
                    )}
                </Typography>
            }
            loading={!!resultsLoadingETA[collection]}
            loadingETA={resultsLoadingETA[collection]}
            loadingHeight={3}
        >
            {resultsViewType === 'list' ? <ResultsList hits={hits} /> : <ResultsTable hits={hits} />}
        </Expandable>
    )
})
