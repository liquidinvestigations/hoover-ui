import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Button, CircularProgress } from '@material-ui/core'
import { useSearch } from '../SearchProvider'
import { DEFAULT_FACET_SIZE } from '../../../constants/general'

const useStyles = makeStyles(theme => ({
    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },
}))

export default function MoreButton ({ field }) {
    const classes = useStyles()
    const { aggregations, aggregationsLoading, resultsLoading, query, search } = useSearch()

    const handleLoadMore = page => {
        const facets = query.facets || {}
        search({ facets: { ...facets, [key]: page }, page: 1 })
    }

    const pageParam = parseInt(query.facets?.[field])
    const page = isNaN(pageParam) ? 1 : pageParam

    const cardinality = aggregations?.[field]?.values.count
    const hasMore = cardinality?.value > page * DEFAULT_FACET_SIZE

    const loading = aggregationsLoading || resultsLoading

    return hasMore && (
        <>
            <Button
                size="small"
                disabled={loading}
                variant="text"
                onClick={handleLoadMore}>
                More ({cardinality.value - page * DEFAULT_FACET_SIZE})
            </Button>

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
