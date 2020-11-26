import React, { memo } from 'react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Section from './Section'
import { isPrintMode, searchPath } from '../../utils'
import {
    SEARCH_FROM,
    SEARCH_IN_REPLY_TO,
    SEARCH_MODIFICATION_DATE,
    SEARCH_SUBJECT,
    SEARCH_THREAD_INDEX,
    SEARCH_TO
} from '../../constants'

const useStyles = makeStyles({
    preWrap: {
        whiteSpace: 'pre-wrap'
    },
})

function EmailSection({ doc = {} }) {
    const classes = useStyles()

    const printMode = isPrintMode()

    const data = doc.content

    if (data.filetype !== 'email') {
        return null
    }

    const to = (data.to || []).filter(Boolean).join(', ')

    return (
        <Section title="Email">
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>
                            {data.from && !printMode ?
                                <Link href={searchPath(data.from, SEARCH_FROM)}>
                                    <a title="search emails from">From</a>
                                </Link>
                                :
                                'From'
                            }
                        </TableCell>
                        <TableCell>
                                <pre className={classes.preWrap}>
                                    {data.from}
                                </pre>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            {data.to && !printMode ?
                                <Link href={searchPath(to, SEARCH_TO)}>
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
                            {data.date && !printMode ?
                                <Link href={searchPath(data.date, SEARCH_MODIFICATION_DATE)}>
                                    <a title="search sent this date">Date</a>
                                </Link>
                                :
                                'Date'
                            }
                        </TableCell>
                        <TableCell>
                            <pre className={classes.preWrap}>
                                {data.date}
                            </pre>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>
                            {data.subject && !printMode ?
                                <Link href={searchPath(data.subject, SEARCH_SUBJECT)}>
                                    <a title="search emails with subject">Subject</a>
                                </Link>
                                :
                                'Subject'
                            }
                        </TableCell>
                        <TableCell>
                            <pre className={classes.preWrap}>
                                {data.subject || '---'}
                            </pre>
                        </TableCell>
                    </TableRow>
                    {data['message-id'] && !printMode &&
                        <TableRow>
                            <TableCell colSpan={2}>
                                <Link href={searchPath(data['message-id'], SEARCH_IN_REPLY_TO)}>
                                    <a>search e-mails replying to this one</a>
                                </Link>
                            </TableCell>
                        </TableRow>
                    }
                    {data['thread-index'] && !printMode &&
                    <TableRow>
                        <TableCell colSpan={2}>
                            <Link href={searchPath(data['thread-index'], SEARCH_THREAD_INDEX)}>
                                <a>search e-mails in this thread</a>
                            </Link>
                        </TableCell>
                    </TableRow>
                    }
                </TableBody>
            </Table>
        </Section>
    )
}

export default memo(EmailSection)
