import React, { memo, useCallback } from 'react'
import Link from 'next/link'
import { IconButton, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { CallMade } from '@material-ui/icons'
import DateLinks from './DateLinks'
import { useDocument } from './DocumentProvider'
import { useHashState } from '../HashStateProvider'
import { createSearchParams, createSearchUrl } from '../../queryUtils'
import { formatDateTime } from '../../utils'
import { useSearch } from '../search/SearchProvider'
import { aggregationFields } from '../../constants/aggregationFields'

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
        searchKey: 'from.keyword',
        tooltip: 'search emails from',
        linkVisible: term => !!term?.length,
    },
    to: {
        label: 'To',
        searchKey: 'to.keyword',
        searchTerm: term => (term || []).filter(Boolean).join(', '),
        tooltip: 'search emails to',
        linkVisible: term => !!term?.length,
    },
    date: {
        label: 'Date',
        tooltip: 'search this date',
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
    const { query, mergedSearch } = useSearch()
    const { data, collection, digest, printMode } = useDocument()

    const handleAddSearch = (field, term) => useCallback(() => {
        mergedSearch(createSearchParams(field, term, query?.filters?.[field]?.interval))
    }, [mergedSearch])

    const hash = { preview: { c: collection, i: digest }, tab: hashState.tab }

    return (
        <Table>
            <TableBody>
                {Object.entries(tableFields).map(([field, config]) => {
                    const term = data.content[field]
                    const display = config.format ? config.format(term) : term
                    const searchKey = config.searchKey || field
                    const searchTerm = config.searchTerm ? config.searchTerm(term) : term

                    return (
                        <TableRow key={field}>
                            <TableCell>{config.label}</TableCell>
                            <TableCell>
                                <pre className={classes.preWrap}>
                                    {printMode || !config.linkVisible(term) ? display :
                                        <>
                                            <Link
                                                href={createSearchUrl(searchTerm, searchKey,
                                                    collection, hash, query?.filters?.[searchKey]?.interval)}
                                                shallow
                                            >
                                                <a title={config.tooltip}>{display}</a>
                                            </Link>
                                            {aggregationFields[searchKey]?.type === 'date' && (
                                                <>
                                                    <br />
                                                    <DateLinks field={searchKey} term={searchTerm} />
                                                </>
                                            )}
                                        </>
                                    }
                                </pre>
                            </TableCell>
                            {mergedSearch && (
                                <TableCell>
                                    {config.linkVisible(term) && (
                                        <IconButton
                                            edge="end"
                                            onClick={handleAddSearch(searchKey, searchTerm)}
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
