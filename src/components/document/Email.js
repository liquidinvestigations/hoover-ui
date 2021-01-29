import React, { memo } from 'react'
import Link from 'next/link'
import { DateTime } from 'luxon'
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useDocument } from './DocumentProvider'
import { searchPath } from '../../queryUtils'
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
    const { data, collection, printMode } = useDocument()
    const to = (data.content.to || []).filter(Boolean).join(', ')

    return (
        <Table>
            <TableBody>
                <TableRow>
                    <TableCell>
                        {data.content.from?.length && !printMode ?
                            <Link href={searchPath(data.content.from, SEARCH_FROM, collection)} shallow>
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
                            <Link href={searchPath(to, SEARCH_TO, collection)} shallow>
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
                            <Link href={searchPath(data.content.date, SEARCH_DATE, collection)} shallow>
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
                            <Link href={searchPath(data.content.subject, SEARCH_SUBJECT, collection)} shallow>
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
                            <Link href={searchPath(data.content['message-id'], SEARCH_IN_REPLY_TO, collection)} shallow>
                                <a>search e-mails replying to this one</a>
                            </Link>
                        </TableCell>
                    </TableRow>
                )}

                {data.content['thread-index'] && !printMode && (
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Link href={searchPath(data.content['thread-index'], SEARCH_THREAD_INDEX, collection)} shallow>
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
