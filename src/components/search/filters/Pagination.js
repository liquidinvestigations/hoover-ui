import React from 'react'
import { makeStyles } from '@mui/styles'
import { CircularProgress, IconButton } from '@mui/material'
import { useSearch } from '../SearchProvider'
import { DEFAULT_FACET_SIZE } from '../../../constants/general'
import { reactIcons } from '../../../constants/icons'

const useStyles = makeStyles(theme => ({
    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },
}))

export default function Pagination({ field }) {
    const classes = useStyles()
    const { aggregations, aggregationsLoading, query, search } = useSearch()

    const handlePagination = newPage => {
        const { [field]: prevFacet, ...restFacets } = query.facets || {}
        if (newPage > 1) {
            search({ facets: { [field]: newPage, ...restFacets, page: 1 } })
        } else {
            search({ facets: { ...restFacets }, page: 1 })
        }
    }

    const pageParam = parseInt(query.facets?.[field])
    const page = isNaN(pageParam) ? 1 : pageParam

    const handlePrev = () => handlePagination(page - 1)
    const handleNext = () => handlePagination(page + 1)

    const hasNext = aggregations?.[field]?.values.buckets.length >= DEFAULT_FACET_SIZE
    const hasPrev = page > 1

    return (hasPrev || hasNext) && (
        <>
            <IconButton
                size="small"
                tabIndex="-1"
                onClick={handlePrev}
                disabled={aggregationsLoading[field] || !hasPrev}
                data-test="prev-buckets-page"
            >
                {reactIcons.chevronLeft}
            </IconButton>

            <IconButton
                size="small"
                onClick={handleNext}
                disabled={aggregationsLoading[field] || !hasNext}
                data-test="next-buckets-page"
            >
                {reactIcons.chevronRight}
            </IconButton>

            {aggregationsLoading[field] && (
                <CircularProgress
                    size={18}
                    thickness={5}
                    className={classes.loading}
                />
            )}
        </>
    )
}
