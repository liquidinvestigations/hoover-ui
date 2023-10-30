import { T } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { useSharedStore } from '../../../SharedStoreProvider'
import { SearchViewOptions } from '../../SearchViewOptions/SearchViewOptions'
import { Pagination } from '../Pagination/Pagination'
import { ResultsGroup } from '../ResultsGroup/ResultsGroup'

export const Results: FC = observer(() => {
    const {
        searchViewStore: { searchCollections },
        searchResultsStore: { results, resultsLoadingETA },
    } = useSharedStore().searchStore

    const sortedResults = [...results].sort((a, b) => {
        const etaA = resultsLoadingETA[a.collection] ?? Infinity
        const etaB = resultsLoadingETA[b.collection] ?? Infinity

        return etaA - etaB
    })

    return (
        <>
            <SearchViewOptions />
            <Pagination />

            {!searchCollections.length ? (
                <i>
                    <T keyName="no_collections_selected">no collections selected</T>
                </i>
            ) : (
                <>
                    {sortedResults.map(({ collection, hits }) => (
                        <ResultsGroup key={collection} collection={collection} hits={hits} />
                    ))}
                    {!Object.keys(resultsLoadingETA).length && <Pagination />}
                </>
            )}
        </>
    )
})
