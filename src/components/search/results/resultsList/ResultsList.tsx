import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { Hits, SearchQueryParams } from '../../../../Types'
import { documentViewUrl } from '../../../../utils/utils'
import { useSharedStore } from '../../../SharedStoreProvider'

import { ResultItem } from './ResultItem/ResultItem'

interface ResultsListProps {
    hits?: Hits
}

export const ResultsList: FC<ResultsListProps> = observer(({ hits }) => {
    const { page, size } = useSharedStore().searchStore.query as SearchQueryParams
    const start = 1 + (page - 1) * size

    return (
        <>
            {hits?.hits.map((hit, i) => (
                <ResultItem key={hit._id + i} hit={hit} url={documentViewUrl(hit)} index={start + i} />
            ))}
        </>
    )
})
