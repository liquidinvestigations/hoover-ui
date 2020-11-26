import React from 'react'
import ReactPlaceholder from 'react-placeholder'
import Pagination from './Pagination'
import ResultItem from './ResultItem'
import { documentViewUrl } from '../utils'

export default function SearchResults({ loading, results, query, changePage }) {
    if (!results?.hits?.hits) {
        return null
    }
    const start = 1 + (query.page - 1) * query.size

    return (
        <>
            <Pagination
                total={parseInt(results.hits.total)}
                size={parseInt(query.size)}
                page={parseInt(query.page)}
                changePage={changePage}
            />
            <ReactPlaceholder
                showLoadingAnimation
                ready={!loading}
                type="text"
                rows={10}
            >
                {results.hits.hits.map((hit, i) =>
                    <ResultItem
                        key={hit._url}
                        hit={hit}
                        url={documentViewUrl(hit)}
                        index={start + i}
                    />
                )}
                {results.hits.hits.length &&
                    <Pagination
                        total={parseInt(results.hits.total)}
                        size={parseInt(query.size)}
                        page={parseInt(query.page)}
                        changePage={changePage}
                    />
                }
            </ReactPlaceholder>
        </>
    )
}
