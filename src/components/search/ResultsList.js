import ReactPlaceholder from 'react-placeholder'
import { useSearch } from './SearchProvider'
import { ResultItem } from './ResultItem'
import { documentViewUrl } from '../../utils'

export default function ResultsList() {
    const { query, results, resultsLoading } = useSearch()
    const start = 1 + (query.page - 1) * query.size

    if (!results) {
        return null
    }

    return (
        <ReactPlaceholder showLoadingAnimation ready={!resultsLoading} type="text" rows={10}>
            {results.hits.hits.map((hit, i) => (
                <ResultItem key={hit._id + i} hit={hit} url={documentViewUrl(hit)} index={start + i} />
            ))}
        </ReactPlaceholder>
    )
}
