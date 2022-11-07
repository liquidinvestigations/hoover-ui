import { makeStyles } from '@mui/styles'
import { Button, CircularProgress } from '@mui/material'
import { useSearch } from '../SearchProvider'
import { DEFAULT_FACET_SIZE } from '../../../constants/general'

const useStyles = makeStyles((theme) => ({
    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },
}))

export default function MoreButton({ field }) {
    const classes = useStyles()
    const { aggregations, aggregationsLoading, query, search } = useSearch()

    const pageParam = parseInt(query.facets?.[field])
    const page = isNaN(pageParam) ? 1 : pageParam

    const handleLoadMore = () => {
        const facets = query.facets || {}
        search({ facets: { ...facets, [field]: page + 1 }, page: 1 })
    }

    const cardinality = aggregations?.[field]?.count
    const hasMore = cardinality?.value > page * DEFAULT_FACET_SIZE

    return (
        hasMore && (
            <>
                <Button size="small" disabled={aggregationsLoading[field]} variant="text" onClick={handleLoadMore}>
                    More ({cardinality.value - page * DEFAULT_FACET_SIZE})
                </Button>

                {aggregationsLoading[field] && <CircularProgress size={18} thickness={5} className={classes.loading} />}
            </>
        )
    )
}
