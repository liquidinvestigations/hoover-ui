import React, { memo } from 'react'
import ReactPlaceholder from 'react-placeholder'
import Pagination from './Pagination'
import ResultItem from './ResultItem'
import { useSearch } from './SearchProvider'
import { documentViewUrl } from '../../utils'
import 'react-placeholder/lib/reactPlaceholder.css'

function Results({ maxCount }) {
    const { query, results, resultsLoading } = useSearch()
    const start = 1 + (query.page - 1) * query.size

    return (
        <>
            <Pagination maxCount={maxCount} />
            <ReactPlaceholder
                showLoadingAnimation
                ready={!resultsLoading}
                type="text"
                rows={10}
            >
                {!!results && !query.collections?.length &&
                    <i>no collections selected</i>
                }
                {results?.hits.hits.map((hit, i) =>
                    <ResultItem
                        key={hit._url}
                        hit={hit}
                        url={documentViewUrl(hit)}
                        index={start + i}
                    />
                )}
                {!!results?.hits.hits.length &&
                    <Pagination maxCount={maxCount} />
                }
            </ReactPlaceholder>
        </>
    )
}

export default memo(Results)
