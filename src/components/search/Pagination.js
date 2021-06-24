import React, { memo } from 'react'
import cn from 'classnames'
import { Grid, IconButton, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { formatThousands } from '../../utils';
import SearchSize from './SearchSize'
import { useSearch } from './SearchProvider'
import { reactIcons } from '../../constants/icons'

const MAX_PREV_PAGES = 3
const MAX_NEXT_PAGES = 3

const useStyles = makeStyles(theme => ({
    pageLink: {
        cursor: 'pointer',
        margin: theme.spacing(1),
        '&:hover': {
            textDecoration: 'underline',
        },
    },
    pageLinkCurrent: {
        cursor: 'default',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
}))

const createPageArray = (start, count) => Array.from({
    length: count
}, (_, i) => i + start)

function Pagination({ maxCount }) {
    const classes = useStyles()
    const { query, search, results } = useSearch()

    const total = parseInt(results?.hits.total || 0)
    const size = parseInt(query.size || 10)
    const page = parseInt(query.page || 0)

    const handleNext = () => search({ page: page + 1 })
    const handlePrev = () => search({ page: page - 1 })
    const handleSet = page => () => search({ page })

    const pageCount = Math.ceil(Math.min(total, maxCount) / size)

    const from = total === 0 ? 0 : page * size - (size - 1)
    const to = Math.min(total, page * size, maxCount)

    const hasNext = page < pageCount
    const hasPrev = page > 1

    const pages = {
        left: [],
        middle: [],
        right: [],
    }
    if (pageCount <= MAX_PREV_PAGES + MAX_NEXT_PAGES + 1) {
        pages.middle.push(...createPageArray(1, Math.min(MAX_PREV_PAGES + MAX_NEXT_PAGES + 1, pageCount)))
    } else if (page - 1 <= MAX_PREV_PAGES) {
        pages.left.push(...createPageArray(1, MAX_PREV_PAGES + MAX_NEXT_PAGES + 1))
        pages.right.push(pageCount)
    } else if (page + MAX_NEXT_PAGES + 1 <= pageCount) {
        pages.left.push(1)
        pages.middle.push(...createPageArray(page - MAX_PREV_PAGES, MAX_PREV_PAGES + MAX_NEXT_PAGES + 1))
        pages.right.push(pageCount)
    } else {
        pages.left.push(1)
        pages.right.push(...createPageArray(page - MAX_PREV_PAGES, MAX_PREV_PAGES + pageCount - page + 1))
    }

    return (
        <Grid container>
            <Grid item container alignItems="center" justify="space-between" style={{ marginTop: '1rem' }}>
                <Grid item>
                    <Typography variant="caption">
                        {`Showing ${from} - ${to} of ${formatThousands(total)} hits. `}
                        {`Page ${total === 0 ? 0 : page} of ${formatThousands(pageCount)} pages.`}
                        {total > maxCount && (
                            <>
                                <br />
                                {`Only the first ${maxCount} hits can be paginated here.`}
                            </>
                        )}
                    </Typography>
                </Grid>

                <Grid item>
                    <SearchSize page={page} size={size} />
                </Grid>
            </Grid>
            {total > 0 && (
                <Grid item container justify="space-between" alignItems="center">
                    <Grid item>
                        <IconButton
                            onClick={handlePrev}
                            disabled={!hasPrev}
                            data-test="prev-results-page"
                        >
                            {reactIcons.chevronLeft}
                        </IconButton>
                    </Grid>
                    <Grid item container justify="space-between" style={{ flex: 1 }}>
                        {Object.entries(pages).map(([group, items]) =>
                            <Grid item key={group}>
                                {items.map((p, i) =>
                                    <Typography
                                        key={i}
                                        component="a"
                                        variant="caption"
                                        onClick={page !== p ? handleSet(p) : null}
                                        className={cn(classes.pageLink, { [classes.pageLinkCurrent]: page === p })}
                                    >
                                        {p}
                                    </Typography>
                                )}
                            </Grid>
                        )}
                    </Grid>
                    <Grid item>
                        <IconButton
                            onClick={handleNext}
                            disabled={!hasNext}
                            data-test="next-results-page"
                        >
                            {reactIcons.chevronRight}
                        </IconButton>
                    </Grid>
                </Grid>
            )}
        </Grid>
    )
}

export default memo(Pagination)
