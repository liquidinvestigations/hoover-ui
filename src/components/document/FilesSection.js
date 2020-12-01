import React, { memo, useState } from 'react'
import Link from 'next/link'
import url from 'url'
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { CloudDownload as IconCloudDownload } from '@material-ui/icons'
import api from '../../api'
import Section from './Section'
import Loading from '../Loading'

function FilesSection({ data, page, hasNextPage, baseUrl, docUrl, title, fullPage }) {
    const [files, setFiles] = useState(data)
    const [currentPage, setCurrentPage] = useState(page)
    const [currentHasNextPage, setCurrentHasNextPage] = useState(hasNextPage)
    const [isFetchingChildrenPage, setFetchingChildrenPage] = useState(false)

    const loadMore = async event => {
        event.preventDefault()
        setFetchingChildrenPage(true)
        const nextDoc = await api.doc(docUrl, currentPage + 1)
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
                            href={api.downloadUrl(url.resolve(baseUrl, digest), filename)}
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
        filesRows.length > 0 && (
            <Section title={title} scrollX={true}>
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
            </Section>
        )
    )
}

export default memo(FilesSection)
