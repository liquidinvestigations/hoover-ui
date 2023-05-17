import { Box, Table, TableBody, TableCell, TableRow } from '@mui/material'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'
import { SyntheticEvent, useEffect, useState } from 'react'

import { createDownloadUrl, doc as docAPI } from '../../../../../backend/api'
import { reactIcons } from '../../../../../constants/icons'
import { humanFileSize } from '../../../../../utils/utils'
import { Loading } from '../../../../common/Loading/Loading'
import { useSharedStore } from '../../../../SharedStoreProvider'

import { useStyles } from './Files.styles'

export const Files = observer(() => {
    const { classes } = useStyles()
    const {
        fullPage,
        documentStore: { data, collectionBaseUrl, pathname },
    } = useSharedStore()

    const [files, setFiles] = useState(data?.children)
    const [currentPage, setCurrentPage] = useState(data?.children_page)
    const [currentHasNextPage, setCurrentHasNextPage] = useState(data?.children_has_next_page)
    const [isFetchingChildrenPage, setFetchingChildrenPage] = useState(false)

    const loadMore = async (event: SyntheticEvent) => {
        event.preventDefault()
        setFetchingChildrenPage(true)
        const nextDoc = await docAPI(pathname, (currentPage || 0) + 1)
        setCurrentPage(nextDoc.children_page)
        setCurrentHasNextPage(nextDoc.children_has_next_page)
        setFiles([...(files || []), ...nextDoc.children])
        setFetchingChildrenPage(false)
    }

    useEffect(() => {
        if (!data) return;
        setFiles(data.children)
        setCurrentPage(data.children_page)
        setCurrentHasNextPage(data.children_has_next_page)
    }, [data])

    const filesRows = files?.map(({ id, digest, file, filename, content_type, filetype, size }, index) => (
        <TableRow key={index}>
            <TableCell className={classes.cell}>
                {id ? <Link href={`${collectionBaseUrl}/${file || id}`}>{filename}</Link> : <span>{filename}</span>}
            </TableCell>
            <TableCell className={classes.cell}>
                {digest && (
                    <a
                        href={createDownloadUrl(`${collectionBaseUrl}/${digest}`, filename)}
                        target={fullPage ? undefined : '_blank'}
                        rel="noreferrer"
                        title="Original file"
                        className={classes.link}>
                        {reactIcons.download}
                    </a>
                )}
            </TableCell>
            <TableCell className={classes.cell}>{content_type}</TableCell>
            <TableCell className={classes.cell}>{!!size && humanFileSize(size)}</TableCell>
        </TableRow>
    ))

    return (
        <Box className={classes.box}>
            <Table>
                <TableBody>
                    {filesRows}
                    {currentHasNextPage && (
                        <TableRow>
                            <TableCell colSpan={4} className={classes.more}>
                                {isFetchingChildrenPage ? (
                                    <Loading />
                                ) : (
                                    <a href="src/components/document#" onClick={loadMore}>
                                        load more...
                                    </a>
                                )}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    )
})
