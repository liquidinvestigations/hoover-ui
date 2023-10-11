import { Table, TableBody, TableCell, TableRow } from '@mui/material'
import { T, useTolgee } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'
import { useState, MouseEvent, ReactElement } from 'react'
import { Entry } from 'type-fest'

import { Category, DocumentContent, SourceField } from '../../../../../Types'
import { createSearchUrl } from '../../../../../utils/queryUtils'
import { formatDateTime } from '../../../../../utils/utils'
import { useSharedStore } from '../../../../SharedStoreProvider'
import { LinkMenu } from '../../../LinkMenu'

import { useStyles } from './Email.styles'

const tableFields: Partial<
    Record<
        SourceField,
        { label: ReactElement; searchKey?: SourceField; linkVisible: (term: any) => boolean; format?: (term: string, locale?: string) => string }
    >
> = {
    from: {
        label: <T keyName="email_from">From</T>,
        searchKey: 'from.keyword',
        linkVisible: (term: string[]) => !!term?.length,
    },
    to: {
        label: <T keyName="email_to">To</T>,
        searchKey: 'to.keyword',
        linkVisible: (term: string[]) => !!term?.length,
    },
    date: {
        label: <T keyName="email_date">Date</T>,
        format: formatDateTime,
        linkVisible: (term: string) => !!term,
    },
    subject: {
        label: <T keyName="email_subject">Subject</T>,
        format: (term: string) => term || '---',
        linkVisible: (term: string[]) => !!term?.length,
    },
}

export const Email = observer(() => {
    const { classes } = useStyles()
    const {
        printMode,
        hashStore: { hashState },
        documentStore: { data, collection, digest },
    } = useSharedStore()
    const tolgee = useTolgee(['language'])

    const [menuPosition, setMenuPosition] = useState<{ left: number; top: number } | undefined>()
    const [currentLink, setCurrentLink] = useState<{ field: SourceField; term: string | string[] } | undefined>()

    const handleLinkClick = (field: SourceField, term: string | string[]) => (event: MouseEvent) => {
        setCurrentLink({ field, term })
        setMenuPosition({ left: event.clientX, top: event.clientY })
    }

    const handleLinkMenuClose = () => {
        setMenuPosition(undefined)
    }

    const hash = { preview: { c: collection, i: digest }, tab: hashState.tab }

    const ensureArray = (value: any) => (Array.isArray(value) ? value : [value])

    return (
        <>
            <Table>
                <TableBody>
                    {(Object.entries(tableFields) as Entry<typeof tableFields>[]).map(([field, config]) => {
                        const term = data?.content[field as keyof DocumentContent] as string | string[]
                        const formatted = config?.format ? config.format(term as string, tolgee.getLanguage()) : (term as string)
                        const searchKey = config?.searchKey || field

                        return (
                            <TableRow key={field}>
                                <TableCell>{config?.label}</TableCell>
                                <TableCell>
                                    <pre className={classes.preWrap}>
                                        {printMode || !config?.linkVisible(term) ? (
                                            formatted
                                        ) : (
                                            <>
                                                {Array.isArray(term) ? (
                                                    term.map((termEl, index) => (
                                                        <span key={index} className={classes.searchField} onClick={handleLinkClick(searchKey, termEl)}>
                                                            {termEl}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <span className={classes.searchField} onClick={handleLinkClick(searchKey, term)}>
                                                        {formatted}
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </pre>
                                </TableCell>
                            </TableRow>
                        )
                    })}

                    {data?.content['message-id' as keyof DocumentContent] &&
                        !printMode &&
                        ensureArray(data.content['message-id' as keyof DocumentContent]).map((messageId, index) => (
                            <TableRow key={index}>
                                <TableCell colSpan={2}>
                                    <Link
                                        href={createSearchUrl(messageId, collection as Category, 'in-reply-to' as SourceField, hash)}
                                        shallow
                                        target="_blank">
                                        <T keyName="search_replying_emails">search e-mails replying to this one</T>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}

                    {data?.content['thread-index' as keyof DocumentContent] &&
                        !printMode &&
                        ensureArray(data?.content['thread-index' as keyof DocumentContent]).map((threadIndex, index) => (
                            <TableRow key={index}>
                                <TableCell colSpan={2}>
                                    <Link href={createSearchUrl(threadIndex, collection as Category, 'thread-index', hash)} shallow target="_blank">
                                        <T keyName="search_thread_emails">search e-mails in this thread</T>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                </TableBody>
            </Table>
            <LinkMenu link={currentLink as { field: SourceField; term: string }} anchorPosition={menuPosition} onClose={handleLinkMenuClose} />
        </>
    )
})
