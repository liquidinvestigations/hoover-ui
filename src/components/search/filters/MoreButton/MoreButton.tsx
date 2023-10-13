import { Button, CircularProgress } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { DEFAULT_FACET_SIZE } from '../../../../constants/general'
import { SearchType } from '../../../../stores/search/SearchStore'
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
            searchAggregationsStore: { aggregations, aggregationsLoading },
        },
    } = useSharedStore()

    const page = query?.facets?.[field] ? parseInt(query.facets[field] as unknown as string) : 1

    const handleLoadMore = () => {
        const facets = query?.facets || {}
        search(
            { facets: { ...facets, [field]: page + 1 }, page: defaultSearchParams.page },
            { searchType: SearchType.Aggregations, keepFromClearing: field, fieldList: [field] },
        )
    }

    const cardinality = (aggregations?.[field]?.count.value || 1) - (aggregations?.[field]?.values.buckets?.length || 0)
    const hasMore = cardinality > page * DEFAULT_FACET_SIZE

    return hasMore ? (
        <>
            <Button size="small" disabled={!!aggregationsLoading[field]} variant="text" onClick={handleLoadMore}>
                More ({cardinality})
            </Button>

            {!!aggregationsLoading[field] && <CircularProgress size={18} thickness={5} className={classes.loading} />}
        </>
    ) : null
})
