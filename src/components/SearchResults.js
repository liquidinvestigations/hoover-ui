import React from 'react'
import PropTypes from 'prop-types'
import ReactPlaceholder from 'react-placeholder'
import Pagination from './Pagination'
import ResultItem from './ResultItem'
import { documentViewUrl } from '../utils'

SearchResults.propTypes = {
    query: PropTypes.object.isRequired,
    results: PropTypes.object,
    isFetching: PropTypes.bool.isRequired,
}

export default function SearchResults({ results, query, isFetching }) {
    if (!results.hits.hits) {
        return null
    }

    const start = 1 + (query.page - 1) * query.size

    const resultList = results.hits.hits.map((hit, i) => (
        <ResultItem
            key={hit._url}
            hit={hit}
            url={documentViewUrl(hit)}
            index={start + i}
        />
    ))

    return (
        <div>
            <Pagination />

            <ReactPlaceholder
                showLoadingAnimation
                ready={!isFetching}
                type="text"
                rows={10}>
                {resultList}

                {!!resultList.length && <Pagination />}
            </ReactPlaceholder>
        </div>
    )
}
