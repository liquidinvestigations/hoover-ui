import React, { memo, useState } from 'react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableRow } from '@mui/material'
import { makeStyles } from '@mui/styles'
import LinkMenu from './LinkMenu'
import { useDocument } from './DocumentProvider'
import { useHashState } from '../HashStateProvider'
import { formatDateTime } from '../../utils'
import { createSearchUrl } from '../../queryUtils'

const useStyles = makeStyles(theme => ({
    preWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        whiteSpace: 'pre-wrap',
    },
    icon: {
        transform: 'rotate(-90deg)',
    },
    searchField: {
        cursor: 'pointer',
        borderBottom: '1px dotted ' + theme.palette.grey[400],
    }
}))

const tableFields = {
    from: {
        label: 'From',
        searchKey: 'from.keyword',
        linkVisible: term => !!term?.length,
    },
    to: {
        label: 'To',
        searchKey: 'to.keyword',
        linkVisible: term => !!term?.length,
    },
    date: {
        label: 'Date',
        format: formatDateTime,
        linkVisible: term => !!term,
    },
    subject: {
        label: 'Subject',
        format: term => term || '---',
        linkVisible: term => !!term?.length,
    }
}

function Email() {
    const classes = useStyles()
    const { hashState } = useHashState()
    const { data, collection, digest, printMode } = useDocument()

    const [menuPosition, setMenuPosition] = useState(null)
    const [currentLink, setCurrentLink] = useState(null)

    const handleLinkClick = (field, term) => event => {
        setCurrentLink({ field, term })
        setMenuPosition({ left: event.clientX, top: event.clientY })
    }

    const handleLinkMenuClose = () => {
        setMenuPosition(null)
    }

    const hash = { preview: { c: collection, i: digest }, tab: hashState.tab }

    const ensureArray = value => Array.isArray(value) ? value : [value]

    return (
        <>
            <Table>
                <TableBody>
                    {Object.entries(tableFields).map(([field, config]) => {
                        const term = data.content[field]
                        const formatted = config.format ? config.format(term) : term
                        const searchKey = config.searchKey || field

                        return (
                            <TableRow key={field}>
                                <TableCell>{config.label}</TableCell>
                                <TableCell>
                                    <pre className={classes.preWrap}>
                                        {printMode || !config.linkVisible(term) ? formatted :
                                            <>
                                                {Array.isArray(term) ? term.map((termEl, index) =>
                                                        <span
                                                            key={index}
                                                            className={classes.searchField}
                                                            onClick={handleLinkClick(searchKey, termEl)}
                                                        >
                                                            {termEl}
                                                        </span>
                                                    ) :
                                                    <span
                                                        className={classes.searchField}
                                                        onClick={handleLinkClick(searchKey, term)}
                                                    >
                                                        {formatted}
                                                    </span>
                                                }
                                            </>
                                        }
                                    </pre>
                                </TableCell>
                            </TableRow>
                        )
                    })}

                    {data.content['message-id'] && !printMode && ensureArray(data.content['message-id']).map((messageId, index) =>
                        <TableRow key={index}>
                            <TableCell colSpan={2}>
                                <Link href={createSearchUrl(messageId, 'in-reply-to', collection, hash)} shallow>
                                    <a>search e-mails replying to this one</a>
                                </Link>
                            </TableCell>
                        </TableRow>
                    )}

                    {data.content['thread-index'] && !printMode && ensureArray(data.content['thread-index']).map((threadIndex, index) =>
                        <TableRow key={index}>
                            <TableCell colSpan={2}>
                                <Link href={createSearchUrl(threadIndex, 'thread-index', collection, hash)} shallow>
                                    <a>search e-mails in this thread</a>
                                </Link>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
            <LinkMenu
                link={currentLink}
                anchorPosition={menuPosition}
                onClose={handleLinkMenuClose}
            />
        </>
    )
}

export default memo(Email)
