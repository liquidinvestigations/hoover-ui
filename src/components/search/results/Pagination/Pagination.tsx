import { Grid, IconButton, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { DEFAULT_MAX_RESULTS } from '../../../../constants/general'
import { reactIcons } from '../../../../constants/icons'
import { SearchType } from '../../../../stores/search/SearchStore'
import { formatThousands, numberArray } from '../../../../utils/utils'
import { useSharedStore } from '../../../SharedStoreProvider'
import { SearchSize } from '../../SearchSize'

import { useStyles } from './Pagination.styles'

const MAX_PREV_PAGES = 3
const MAX_NEXT_PAGES = 3

export const Pagination: FC = observer(() => {
    const { classes, cx } = useStyles()
    const {
        collectionsData,
        searchStore: {
            query,
            search,
            searchResultsStore: { results },
        },
    } = useSharedStore()

    if (!query || !collectionsData) {
        return null
    }

    const maxResultWindow = Math.max(...collectionsData.map((collectionData) => collectionData.max_result_window))
    const maxCount = maxResultWindow && !isNaN(maxResultWindow) && maxResultWindow < DEFAULT_MAX_RESULTS ? maxResultWindow : DEFAULT_MAX_RESULTS

    const total = Math.max(...results.map(({ collection, hits }) => hits?.total || 0), 0)
    const { size, page } = query

    const handleNext = () => search({ page: page + 1 }, { searchType: SearchType.Results })
    const handlePrev = () => search({ page: page - 1 }, { searchType: SearchType.Results })
    const handleSet = (pageE: number) => () => search({ page: pageE }, { searchType: SearchType.Results })

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
                        <T keyName="pagination_showing_from_to" params={{ from, to, total: formatThousands(total) }}>
                            {'Showing {from} - {to} of {total} hits.'}
                        </T>{' '}
                        <T keyName="pagination_page_of_pages" params={{ page: total === 0 ? 0 : page, pageCount: formatThousands(pageCount) }}>
                            {'Page {page} of {pageCount} pages.'}
                        </T>
                        {total > maxCount && (
                            <>
                                <br />
                                <T keyName="pagination_max_count" params={{ maxCount }}>
                                    {'Only the first {maxCount} hits can be paginated here.'}
                                </T>
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
                                        className={cx(classes.pageLink, { [classes.pageLinkCurrent]: page === p })}
                                    >
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
