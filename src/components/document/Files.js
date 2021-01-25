import React, { memo, useState } from 'react'
import Link from 'next/link'
import url from 'url'
import { Box, Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { CloudDownload as IconCloudDownload } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import Loading from '../Loading'
import { createDownloadUrl, doc as docAPI } from '../../backend/api'

const useStyles = makeStyles(theme => ({
    box: {
        overflowX: 'auto',
    },
    cell: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },
    link: {
        color: theme.palette.grey[600],
    },
    more: {
        padding: theme.spacing(1),
        borderBottom: 'none',
    },
}))

function Files({ data, page, hasNextPage, baseUrl, docUrl, fullPage }) {
    const classes = useStyles()

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

    const filesRows = files.map(({ id, digest, file, filename, content_type, filetype, size }, index) => (
        <TableRow key={index}>
            <TableCell className={classes.cell}>
                {id ? (
                    <Link href={url.resolve(baseUrl, file || id)}>
                        <a>
                            {filename}
                        </a>
                    </Link>
                ) : (
                    <span>{filename}</span>
                )}
            </TableCell>
            <TableCell className={classes.cell}>
                {digest && (
                    <a
                        href={createDownloadUrl(url.resolve(baseUrl, digest), filename)}
                        target={fullPage ? null : '_blank'}
                        title="Original file"
                        className={classes.link}
                    >
                        <IconCloudDownload />
                    </a>
                )}
            </TableCell>
            <TableCell className={classes.cell}>{content_type}</TableCell>
            <TableCell className={classes.cell}>{size}</TableCell>
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
                                {isFetchingChildrenPage ?
                                    <Loading/>
                                    :
                                    <a href="#" onClick={loadMore}>load more...</a>
                                }
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </Box>
    )
}

export default memo(Files)
