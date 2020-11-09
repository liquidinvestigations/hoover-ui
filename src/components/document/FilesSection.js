import React from 'react'
import Link from 'next/link'
import url from 'url'
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core'
import { CloudDownload as IconCloudDownload } from '@material-ui/icons'
import api from '../../api'
import Section from './Section'

export default function FilesSection({ data, baseUrl, title, fullPage }) {

    const files = data.map(({ id, digest, file, filename, content_type, size }, index) => {
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
        files.length > 0 && (
            <Section title={title} scrollX={true}>
                <Table>
                    <TableBody>{files}</TableBody>
                </Table>
            </Section>
        )
    )
}
