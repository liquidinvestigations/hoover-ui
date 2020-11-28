import React, { memo } from 'react'
import { Grid, IconButton, Typography } from '@material-ui/core'
import { NavigateBefore, NavigateNext } from '@material-ui/icons'
import { formatThousands } from '../utils';

function Pagination({ total, size, page, changePage }) {
    const handleNext = () => changePage(page + 1)
    const handlePrev = () => changePage(page - 1)

    const pageCount = Math.ceil(total / size)

    const from = total === 0 ? 0 : page * size - (size - 1)
    const to = Math.min(total, page * size)

    const hasNext = page < pageCount
    const hasPrev = page > 1

    return (
        <Grid container alignItems="center" justify="space-between" style={{ marginTop: '1rem' }}>
            <Grid item>
                <Typography variant="caption">
                    Showing {from} - {to} of {formatThousands(total)} hits.
                    Page {total === 0 ? 0 : page}
                    {' '}
                    of
                    {' '}
                    {formatThousands(pageCount)} pages.
                </Typography>
            </Grid>

            <Grid item>
                <Grid container justify="flex-end">
                    <IconButton
                        tabIndex="-1"
                        onClick={handlePrev}
                        disabled={!hasPrev}>
                        <NavigateBefore />
                    </IconButton>

                    <IconButton
                        onClick={handleNext}
                        disabled={!hasNext}>
                        <NavigateNext />
                    </IconButton>
                </Grid>
            </Grid>
        </Grid>
    )
}

export default memo(Pagination)
