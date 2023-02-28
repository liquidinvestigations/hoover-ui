import { Button, CircularProgress } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { DEFAULT_FACET_SIZE } from '../../../../constants/general'
import { SourceField } from '../../../../Types'
import { defaultSearchParams } from '../../../../utils/queryUtils'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './MoreButton.styles'

export const MoreButton: FC<{ field: SourceField }> = observer(({ field }) => {
    const { classes } = useStyles()
    const {
        searchStore: {
            query,
            search,
            searchAggregationsStore: { aggregationsQueryTasks, aggregationsLoading },
        },
    } = useSharedStore()

    const pageParam = parseInt(query?.facets?.[field])
    const page = isNaN(pageParam) ? 1 : pageParam

    const handleLoadMore = () => {
        const facets = query?.facets || {}
        search({ facets: { ...facets, [field]: page + 1 }, page: defaultSearchParams.page })
    }

    const cardinality = aggregationsQueryTasks?.[1]?.data?.result?.aggregations?.[field]?.count
    const hasMore = cardinality?.value || 1 > page * DEFAULT_FACET_SIZE

    return hasMore ? (
        <>
            <Button size="small" disabled={!!aggregationsLoading?.[1].data?.result?.aggregations[field]} variant="text" onClick={handleLoadMore}>
                More ({cardinality?.value || 1 - page * DEFAULT_FACET_SIZE})
            </Button>

            {aggregationsLoading?.[1].data?.result?.aggregations[field] && <CircularProgress size={18} thickness={5} className={classes.loading} />}
        </>
    ) : null
})
