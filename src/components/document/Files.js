import React, { memo, useState } from 'react'
import Link from 'next/link'
import url from 'url'
import { Box, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { CloudDownload as IconCloudDownload } from '@material-ui/icons'
import Loading from '../Loading'
import { createDownloadUrl, doc as docAPI } from '../../backend/api'

function Files({ data, page, hasNextPage, baseUrl, docUrl, fullPage }) {
    const [files, setFiles] = useState(data)
    const [currentPage, setCurrentPage] = useState(page)
    const [currentHasNextPage, setCurrentHasNextPage] = useState(hasNextPage)
    const [isFetchingChildrenPage, setFetchingChildrenPage] = useState(false)

    const loadMore = async event => {
        event.preventDefault()
        setFetchingChildrenPage(true)
        const nextDoc = await docAPI(docUrl, currentPage + 1)
        setCurrentPage(nextDoc.children_page)
        setCurrentHasNextPage(nextDoc.children_has_next_page)
        setFiles([...files, ...nextDoc.children])
        setFetchingChildrenPage(false)
    }

    const filesRows = files.map(({ id, digest, file, filename, content_type, size }, index) => {
        return (
            <TableRow key={index}>
                <TableCell className="text-muted">{content_type}</TableCell>
                <TableCell className="text-muted">{size}</TableCell>
                <TableCell>
                    {digest && (
                        <a
                            href={createDownloadUrl(url.resolve(baseUrl, digest), filename)}
                            target={fullPage ? null : '_blank'}
                            title="Original file">
                            <IconCloudDownload />
                        </a>
                    )}
                </TableCell>
                <TableCell>
                    {id ? (
                        <Link href={url.resolve(baseUrl, file || id)}>
                            {filename}
                        </Link>
                    ) : (
                        <span>{filename}</span>
                    )}
                </TableCell>
            </TableRow>
        )
    })

    return (
        <Box style={{ overflowX: 'auto' }}>
            <Table>
                <TableBody>
                    {filesRows}
                    {currentHasNextPage &&
                    <TableRow>
                        <TableCell colSpan={4} style={{borderBottom: 'none'}}>
                            {isFetchingChildrenPage ?
                                <Loading/>
                                :
                                <a href="#" onClick={loadMore}>load more...</a>
                            }
                        </TableCell>
                    </TableRow>
                    }
                </TableBody>
            </Table>
        </Box>
    )
}

export default memo(Files)
