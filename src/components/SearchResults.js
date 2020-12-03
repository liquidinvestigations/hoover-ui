import React, { memo } from 'react'
import ReactPlaceholder from 'react-placeholder'
import Pagination from './Pagination'
import ResultItem from './ResultItem'
import { documentViewUrl } from '../utils'

function SearchResults({ loading, results, query, changePage, changeSize, selectedDocUrl, onPreview }) {
    const start = 1 + (query.page - 1) * query.size

    return (
        <>
            <Pagination
                total={parseInt(results?.hits.total || 0)}
                size={parseInt(query.size || 1)}
                page={parseInt(query.page || 0)}
                changePage={changePage}
                changeSize={changeSize}
            />
            <ReactPlaceholder
                showLoadingAnimation
                ready={!loading}
                type="text"
                rows={10}
            >
                {!query.collections?.length &&
                    <i>no collections selected</i>
                }
                {results?.hits.hits.map((hit, i) =>
                    <ResultItem
                        key={hit._url}
                        hit={hit}
                        url={documentViewUrl(hit)}
                        index={start + i}
                        onPreview={onPreview}
                        isPreview={hit._url.endsWith(selectedDocUrl)}
                        unsearchable={!!selectedDocUrl}
                    />
                )}
                {!!results?.hits.hits.length &&
                    <Pagination
                        total={parseInt(results.hits.total)}
                        size={parseInt(query.size)}
                        page={parseInt(query.page)}
                        changePage={changePage}
                        changeSize={changeSize}
                    />
                }
            </ReactPlaceholder>
        </>
    )
}

export default memo(SearchResults)
