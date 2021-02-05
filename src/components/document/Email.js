import React, { memo } from 'react'
import Link from 'next/link'
import { DateTime } from 'luxon'
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useDocument } from './DocumentProvider'
import { useHashState } from '../HashStateProvider'
import { createSearchUrl } from '../../queryUtils'
import {
    SEARCH_FROM,
    SEARCH_IN_REPLY_TO,
    SEARCH_DATE,
    SEARCH_SUBJECT,
    SEARCH_THREAD_INDEX,
    SEARCH_TO
} from '../../constants'

const useStyles = makeStyles({
    preWrap: {
        whiteSpace: 'pre-wrap'
    },
})

function Email() {
    const classes = useStyles()
    const { hashState } = useHashState()
    const { data, collection, digest, printMode } = useDocument()
    const to = (data.content.to || []).filter(Boolean).join(', ')

    const hash = { preview: { c: collection, i: digest }, tab: hashState.tab }

    return (
        <Table>
            <TableBody>
                <TableRow>
                    <TableCell>
                        {data.content.from?.length && !printMode ?
                            <Link href={createSearchUrl(data.content.from, SEARCH_FROM, collection, hash)} shallow>
                                <a title="search emails from">From</a>
                            </Link>
                            :
                            'From'
                        }
                    </TableCell>
                    <TableCell>
                            <pre className={classes.preWrap}>
                                {data.content.from}
                            </pre>
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>
                        {data.content.to?.length && !printMode ?
                            <Link href={createSearchUrl(to, SEARCH_TO, collection, hash)} shallow>
                                <a title="search emails to">To</a>
                            </Link>
                            :
                            'To'
                        }
                    </TableCell>
                    <TableCell>
                        <pre className={classes.preWrap}>
                            {to}
                        </pre>
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>
                        {data.content.date && !printMode ?
                            <Link href={createSearchUrl(data.content.date, SEARCH_DATE, collection, hash)} shallow>
                                <a title="search sent this date">Date</a>
                            </Link>
                            :
                            'Date'
                        }
                    </TableCell>
                    <TableCell>
                        <pre className={classes.preWrap}>
                            {DateTime.fromISO(data.content.date, { locale: 'en-US' })
                                .toLocaleString(DateTime.DATETIME_FULL)}
                        </pre>
                    </TableCell>
                </TableRow>

                <TableRow>
                    <TableCell>
                        {data.content.subject?.length && !printMode ?
                            <Link href={createSearchUrl(data.content.subject, SEARCH_SUBJECT, collection, hash)} shallow>
                                <a title="search emails with subject">Subject</a>
                            </Link>
                            :
                            'Subject'
                        }
                    </TableCell>
                    <TableCell>
                        <pre className={classes.preWrap}>
                            {data.content.subject || '---'}
                        </pre>
                    </TableCell>
                </TableRow>

                {data.content['message-id'] && !printMode && (
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Link href={createSearchUrl(data.content['message-id'], SEARCH_IN_REPLY_TO, collection, hash)} shallow>
                                <a>search e-mails replying to this one</a>
                            </Link>
                        </TableCell>
                    </TableRow>
                )}

                {data.content['thread-index'] && !printMode && (
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Link href={createSearchUrl(data.content['thread-index'], SEARCH_THREAD_INDEX, collection, hash)} shallow>
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
