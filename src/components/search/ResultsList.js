import React from 'react'
import { useSearch } from './SearchProvider'
import ResultItem from './ResultItem'
import { documentViewUrl } from '../../utils'

export default function ResultsList() {
    const { query, results } = useSearch()
    const start = 1 + (query.page - 1) * query.size

    return results?.hits.hits.map((hit, i) =>
        <ResultItem
            key={hit._url}
            hit={hit}
            url={documentViewUrl(hit)}
            index={start + i}
        />
    )
}
