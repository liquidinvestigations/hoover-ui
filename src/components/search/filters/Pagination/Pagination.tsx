import { CircularProgress, IconButton } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { DEFAULT_FACET_SIZE } from '../../../../constants/general'
import { reactIcons } from '../../../../constants/icons'
import { SearchType } from '../../../../stores/search/SearchStore'
import { SourceField } from '../../../../Types'
import { defaultSearchParams } from '../../../../utils/queryUtils'
import { useSharedStore } from '../../../SharedStoreProvider'

import { useStyles } from './Pagination.styles'

export const Pagination: FC<{ field: SourceField }> = observer(({ field }) => {
    const { classes } = useStyles()
    const {
        searchStore: {
            query,
            search,
            searchAggregationsStore: { aggregations, aggregationsLoading },
        },
    } = useSharedStore()

    const handlePagination = (newPage: number) => {
        const { [field]: prevFacet, ...restFacets } = query?.facets || {}
        if (newPage > 1) {
            search({ facets: { [field]: newPage, ...restFacets, page: defaultSearchParams.page } }, SearchType.Aggregations)
        } else {
            search({ facets: { ...restFacets }, page: defaultSearchParams.page }, SearchType.Aggregations)
        }
    }

    const pageParam = parseInt(query?.facets?.[field])
    const page = isNaN(pageParam) ? 1 : pageParam

    const handlePrev = () => handlePagination(page - 1)
    const handleNext = () => handlePagination(page + 1)

    const hasNext = aggregations?.[field]?.values?.buckets?.length || 0 >= DEFAULT_FACET_SIZE
    const hasPrev = page > 1

    return hasPrev || hasNext ? (
        <>
            <IconButton
                size="small"
                tabIndex={-1}
                onClick={handlePrev}
                disabled={!!aggregationsLoading?.[1].data?.result?.aggregations[field] || !hasPrev}
                data-test="prev-buckets-page">
                {reactIcons.chevronLeft}
            </IconButton>

            <IconButton
                size="small"
                onClick={handleNext}
                disabled={!!aggregationsLoading?.[1].data?.result?.aggregations[field] || !hasNext}
                data-test="next-buckets-page">
                {reactIcons.chevronRight}
            </IconButton>

            {!!aggregationsLoading?.[1].data?.result?.aggregations[field] && <CircularProgress size={18} thickness={5} className={classes.loading} />}
        </>
    ) : null
})
