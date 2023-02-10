import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import ReactPlaceholder from 'react-placeholder'

import { AsyncQueryTask } from '../../stores/search/AsyncTaskRunner'
import { documentViewUrl } from '../../utils/utils'

import { ResultItem } from './ResultItem'

interface ResultsListProps {
    queryTask: AsyncQueryTask
}

export const ResultsList: FC<ResultsListProps> = observer(({ queryTask }) => {
    const { page, size } = queryTask.query
    const start = 1 + (page - 1) * size

    if (!queryTask.data?.result) {
        return null
    }

    return (
        <ReactPlaceholder showLoadingAnimation ready={queryTask.data?.status === 'done'} type="text" rows={10}>
            {queryTask.data.result.hits.hits.map((hit, i) => (
                <ResultItem key={hit._id + i} hit={hit} url={documentViewUrl(hit)} index={start + i} />
            ))}
        </ReactPlaceholder>
    )
})
