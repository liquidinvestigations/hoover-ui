import { Typography } from '@mui/material'
import { T } from '@tolgee/react'

export const tooltips = {
    tags: (
        <>
            <Typography variant="body2">
                <T keyName="tags_contents">Tags are made of lowercase ASCII letters, digits, and symbols</T>: <code>_!@#$%^&*()-=+:,./?</code>.
            </Typography>
            <Typography variant="body2">
                <T keyName="tags_changes">Changes to tags may take a minute to appear in search.</T>
            </Typography>
            <Typography variant="body2">
                <T keyName="tags_match">Tags must be matched exactly when searching.</T>
            </Typography>
            <Typography variant="body2">
                <T keyName="tags_see_more">See more</T>{' '}
                <a
                    href="https://github.com/liquidinvestigations/docs/wiki/User-Guide:-Hoover#tags"
                    style={{ color: 'white' }}
                    target="_blank"
                    rel="noreferrer"
                >
                    <T keyName="tags_see_more_link">here</T>
                </a>
                .
            </Typography>
        </>
    ),
    search: (
        <>
            <Typography variant="body2">
                <T keyName="search_enter">Enter to search, Shift+Enter for a new line.</T>
            </Typography>
            <Typography variant="body2">
                <T keyName="search_lines">All lines are combined into a single search.</T>
            </Typography>
            <Typography variant="body2">
                <T keyName="search_guide">Refine your search using</T>{' '}
                <a href="https://github.com/hoover/search/wiki/Guide-to-search-terms" style={{ color: 'white' }} target="_blank" rel="noreferrer">
                    <T keyName="search_guide_link">this handy guide</T>
                </a>
                .
            </Typography>
        </>
    ),
}
