import { T } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { UNIFY_RESULTS } from '../../../../consts'
import { useSharedStore } from '../../../SharedStoreProvider'
import { SearchViewOptions } from '../../SearchViewOptions/SearchViewOptions'
import { Pagination } from '../Pagination/Pagination'
import { ResultsGroup } from '../ResultsGroup/ResultsGroup'

export const Results: FC = observer(() => {
    const {
        query,
        searchViewStore: { searchCollections },
        searchResultsStore: { results, resultsLoadingETA, unifiedResults },
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
                    {query?.unify_results === UNIFY_RESULTS.active ? (
                        <ResultsGroup
                            key={unifiedResults.collection}
                            collection={unifiedResults.collection}
                            hits={unifiedResults.hits}
                            loading={!!Object.values(resultsLoadingETA).length}
                        />
                    ) : (
                        sortedResults.map(({ collection, hits }) => <ResultsGroup key={collection} collection={collection} hits={hits} />)
                    )}

                    {!Object.keys(resultsLoadingETA).length && <Pagination />}
                </>
            )}
        </>
    )
})
