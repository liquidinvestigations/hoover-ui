import React, { memo, useCallback } from 'react'
import Link from 'next/link'
import { IconButton, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { CallMade } from '@material-ui/icons'
import { useDocument } from './DocumentProvider'
import { useHashState } from '../HashStateProvider'
import { createSearchUrl } from '../../queryUtils'
import { formatDateTime } from '../../utils'
import { useSearch } from '../search/SearchProvider'

const useStyles = makeStyles({
    preWrap: {
        whiteSpace: 'pre-wrap'
    },
    icon: {
        transform: 'rotate(-90deg)',
    },
})

const tableFields = {
    from: {
        label: 'From',
        tooltip: 'search emails from',
        linkVisible: term => !!term?.length,
    },
    to: {
        label: 'To',
        searchTerm: term => (term || []).filter(Boolean).join(', '),
        tooltip: 'search emails to',
        linkVisible: term => !!term?.length,
    },
    date: {
        label: 'Date',
        tooltip: 'search sent this date',
        format: formatDateTime,
        linkVisible: term => !!term,
    },
    subject: {
        label: 'Subject',
        tooltip: 'search emails with subject',
        format: term => term || '---',
        linkVisible: term => !!term?.length,
    }
}

function Email() {
    const classes = useStyles()
    const { hashState } = useHashState()
    const { query, search } = useSearch()
    const { data, collection, digest, printMode } = useDocument()

    const handleAddSearch = (key, term) => useCallback(() => {
        search({ q: `${query.q}\n${key}:"${term}"` })
    }, [search, query])

    const hash = { preview: { c: collection, i: digest }, tab: hashState.tab }

    return (
        <Table>
            <TableBody>
                {Object.entries(tableFields).map(([key, field]) => {
                    const term = data.content[key]
                    const display = field.format ? field.format(term) : term
                    const searchTerm = field.searchTerm ? field.searchTerm(term) : term

                    return (
                        <TableRow>
                            <TableCell>{field.label}</TableCell>
                            <TableCell>
                                <pre className={classes.preWrap}>
                                    {printMode || !field.linkVisible(term) ? display :
                                        <Link href={createSearchUrl(searchTerm, key, collection, hash)} shallow>
                                            <a title={field.tooltip}>{display}</a>
                                        </Link>
                                    }
                                </pre>
                            </TableCell>
                            {search && (
                                <TableCell>
                                    {field.linkVisible(term) && (
                                        <IconButton
                                            edge="end"
                                            onClick={handleAddSearch(key, searchTerm)}
                                        >
                                            <CallMade className={classes.icon} />
                                        </IconButton>
                                    )}
                                </TableCell>
                            )}
                        </TableRow>
                    )
                })}

                {data.content['message-id'] && !printMode && (
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Link href={createSearchUrl(data.content['message-id'], 'in-reply-to', collection, hash)} shallow>
                                <a>search e-mails replying to this one</a>
                            </Link>
                        </TableCell>
                    </TableRow>
                )}

                {data.content['thread-index'] && !printMode && (
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Link href={createSearchUrl(data.content['thread-index'], 'thread-index', collection, hash)} shallow>
                                <a>search e-mails in this thread</a>
                            </Link>
                        </TableCell>
                    </TableRow>
                )}
            </TableBody>
        </Table>
    )
}

export default memo(Email)
