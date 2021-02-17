import React, { memo, useState } from 'react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import LinkMenu from './LinkMenu'
import { useDocument } from './DocumentProvider'
import { useHashState } from '../HashStateProvider'
import { formatDateTime } from '../../utils'
import { createSearchUrl } from '../../queryUtils'

const useStyles = makeStyles(theme => ({
    preWrap: {
        whiteSpace: 'pre-wrap'
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
        searchTerm: term => (term || []).filter(Boolean).join(', '),
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

    return (
        <>
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
                                                <span
                                                    className={classes.searchField}
                                                    onClick={handleLinkClick(searchKey, searchTerm)}
                                                >
                                                    {display}
                                                </span>
                                            </>
                                        }
                                    </pre>
                                </TableCell>
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
            <LinkMenu
                link={currentLink}
                anchorPosition={menuPosition}
                onClose={handleLinkMenuClose}
            />
        </>
    )
}

export default memo(Email)
