import React from 'react'
import {Typography} from '@material-ui/core'

export const tooltips = {
    tags: (
        <>
            <Typography variant="body2">
                Tags are made of lowercase ASCII letters, digits, and symbols:{' '}
                <code>_!@#$%^&*()-=+:,./?</code>.
            </Typography>
            <Typography variant="body2">
                Changes to tags may take a minute to appear in search.
            </Typography>
            <Typography variant="body2">
                Tags must be matched exactly when searching.
            </Typography>
            <Typography variant="body2">
                See more {' '}
                <a href="https://github.com/liquidinvestigations/docs/wiki/User-Guide:-Hoover#tags" style={{ color: 'white' }} target="_blank" rel="noreferrer">here</a>.
            </Typography>
        </>
    ),
    search: (
        <>
            <Typography variant="body2">Enter to search, Shift+Enter for a new line.</Typography>
            <Typography variant="body2">All lines are combined into a single search.</Typography>
            <Typography variant="body2">
                Refine your search using {' '}
                <a href="https://github.com/hoover/search/wiki/Guide-to-search-terms" style={{ color: 'white' }} target="_blank" rel="noreferrer">this handy guide</a>.
            </Typography>
        </>
    )
}
