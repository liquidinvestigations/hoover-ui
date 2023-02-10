import { Grid, IconButton, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'
import { makeStyles } from 'tss-react/mui'

import { DEFAULT_MAX_RESULTS } from '../../constants/general'
import { reactIcons } from '../../constants/icons'
import { formatThousands, numberArray } from '../../utils/utils'
import { useSharedStore } from '../SharedStoreProvider'

import SearchSize from './SearchSize'

import type { Theme } from '@mui/material'

const MAX_PREV_PAGES = 3
const MAX_NEXT_PAGES = 3

const useStyles = makeStyles()((theme: Theme) => ({
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

interface PaginationProps {
    collection: string
}

export const Pagination: FC<PaginationProps> = observer(({ collection }) => {
    const { classes, cx } = useStyles()
    const {
        collectionsData,
        searchStore: {
            query,
            search,
            searchResultsStore: { resultsQueryTasks },
        },
    } = useSharedStore()

    if (!query) {
        return null
    }

    const queryTask = resultsQueryTasks[collection]

    const maxResultWindow = collectionsData.find((collectionData) => collectionData.name === collection)?.max_result_window
    const maxCount = maxResultWindow && !isNaN(maxResultWindow) && maxResultWindow < DEFAULT_MAX_RESULTS ? maxResultWindow : DEFAULT_MAX_RESULTS

    const total = queryTask.data?.result?.hits.total || 0
    const { size, page } = query

    const handleNext = () => search({ page: page + 1 })
    const handlePrev = () => search({ page: page - 1 })
    const handleSet = (page: number) => () => search({ page })

    const pageCount = Math.ceil(Math.min(total, maxCount) / size)

    const from = total === 0 ? 0 : page * size - (size - 1)
    const to = Math.min(total, page * size, maxCount)

    const hasNext = page < pageCount
    const hasPrev = page > 1

    const pages: Record<string, number[]> = {
        left: [],
        middle: [],
        right: [],
    }

    if (pageCount <= MAX_PREV_PAGES + MAX_NEXT_PAGES + 1) {
        pages.middle.push(...numberArray(1, Math.min(MAX_PREV_PAGES + MAX_NEXT_PAGES + 1, pageCount)))
    } else if (page - 1 <= MAX_PREV_PAGES) {
        pages.left.push(...numberArray(1, MAX_PREV_PAGES + MAX_NEXT_PAGES + 1))
        pages.right.push(pageCount)
    } else if (page + MAX_NEXT_PAGES + 1 <= pageCount) {
        pages.left.push(1)
        pages.middle.push(...numberArray(page - MAX_PREV_PAGES, MAX_PREV_PAGES + MAX_NEXT_PAGES + 1))
        pages.right.push(pageCount)
    } else {
        pages.left.push(1)
        pages.right.push(...numberArray(page - MAX_PREV_PAGES, MAX_PREV_PAGES + pageCount - page + 1))
    }

    return (
        <Grid container>
            <Grid item container alignItems="center" justifyContent="space-between" style={{ marginTop: '1rem' }}>
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
                <Grid item container justifyContent="space-between" alignItems="center">
                    <Grid item>
                        <IconButton onClick={handlePrev} disabled={!hasPrev} data-test="prev-results-page" size="large">
                            {reactIcons.chevronLeft}
                        </IconButton>
                    </Grid>
                    <Grid item container justifyContent="space-between" style={{ flex: 1 }}>
                        {Object.entries(pages).map(([group, items]) => (
                            <Grid item key={group}>
                                {items.map((p, i) => (
                                    <Typography
                                        key={i}
                                        component="a"
                                        variant="caption"
                                        onClick={page !== p ? handleSet(p) : undefined}
                                        className={cx(classes.pageLink, { [classes.pageLinkCurrent]: page === p })}>
                                        {p}
                                    </Typography>
                                ))}
                            </Grid>
                        ))}
                    </Grid>
                    <Grid item>
                        <IconButton onClick={handleNext} disabled={!hasNext} data-test="next-results-page" size="large">
                            {reactIcons.chevronRight}
                        </IconButton>
                    </Grid>
                </Grid>
            )}
        </Grid>
    )
})
