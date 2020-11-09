import React from 'react'
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Section from './Section'

const useStyles = makeStyles({
    preWrap: {
        whiteSpace: 'pre-wrap'
    },
})

export default function EmailSection({ doc = {} }) {
    const classes = useStyles()

    const data = doc.content

    if (data.filetype !== 'email') {
        return null
    }

    return (
        <Section title="Email">
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell>From</TableCell>
                        <TableCell>
                                <pre className={classes.preWrap}>
                                    {data.from}
                                </pre>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>To</TableCell>
                        <TableCell>
                                <pre className={classes.preWrap}>
                                    {(data.to || []).filter(Boolean).join(', ')}
                                </pre>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>
                                <pre className={classes.preWrap}>
                                    {data.date}
                                </pre>
                        </TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Subject</TableCell>
                        <TableCell>
                                <pre className={classes.preWrap}>
                                    {data.subject || '---'}
                                </pre>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Section>
    )
}
