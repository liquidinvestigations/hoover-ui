import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { CircularProgress, IconButton } from '@material-ui/core'
import { NavigateBefore, NavigateNext } from '@material-ui/icons'
import { useSearch } from '../SearchProvider'
import { DEFAULT_FACET_SIZE } from '../../../constants/general'

const useStyles = makeStyles(theme => ({
    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },
}))

export default function Pagination({ field }) {
    const classes = useStyles()
    const { aggregations, aggregationsLoading, resultsLoading, query, search } = useSearch()

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

    const loading = aggregationsLoading || resultsLoading

    return (hasPrev || hasNext) && (
        <>
            <IconButton
                size="small"
                tabIndex="-1"
                onClick={handlePrev}
                disabled={loading || !hasPrev}>
                <NavigateBefore/>
            </IconButton>

            <IconButton
                size="small"
                onClick={handleNext}
                disabled={loading || !hasNext}>
                <NavigateNext/>
            </IconButton>

            {loading && (
                <CircularProgress
                    size={18}
                    thickness={5}
                    className={classes.loading}
                />
            )}
        </>
    )
}
