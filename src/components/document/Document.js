import React, { memo } from 'react'
import url from 'url'
import { makeStyles } from '@material-ui/core/styles'
import { IconButton, Toolbar, Tooltip } from '@material-ui/core'
import { ChromeReaderMode, CloudDownload, Launch, Print } from '@material-ui/icons'
import EmailSection from './EmailSection'
import PreviewSection from './PreviewSection'
import HTMLSection from './HTMLSection'
import TextSection from './TextSection'
import FilesSection from './FilesSection'
import MetaSection from './MetaSection'
import Loading from '../Loading'
import api from '../../api'

const useStyles = makeStyles(theme => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        justifyContent: 'space-between',
    },
}))

const parseCollection = url => {
    const [, collection] = url.match(/(?:^|\/)doc\/(.+?)\//) || [];
    return collection;
}

function Document({ docUrl, data, loading, fullPage, showToolbar = true, showMeta = true }) {
    const classes = useStyles()

    if (loading) {
        return <Loading />
    }

    if (!docUrl || !data || !Object.keys(data).length) {
        return null
    }

    const collection = parseCollection(docUrl)
    const collectionBaseUrl = url.resolve(docUrl, './')
    const headerLinks = []

    let digest = data.id
    let digestUrl = docUrl
    let docRawUrl = api.downloadUrl(`${collectionBaseUrl}${digest}`, data.content.filename)

    if (data.id.startsWith('_file_')) {
        digest = data.digest
        digestUrl = [url.resolve(docUrl, './'), data.digest].join('/')
        docRawUrl = api.downloadUrl(`${collectionBaseUrl}${digest}`, data.content.filename)
    }

    if (data.id.startsWith('_directory_')) {
        digest = null
        digestUrl = null
        docRawUrl = null
    }

    if (!fullPage) {
        headerLinks.push({
            href: docUrl,
            text: 'Open in new tab',
            icon: <Launch />,
            target: '_blank',
        });
    }

    if (data.content.filetype !== 'folder') {
        headerLinks.push({
            href: `${docUrl}?print=true`,
            text: `Print metadata and content`,
            icon: <Print />,
            target: '_blank',
        });

        headerLinks.push({
            href: docRawUrl,
            text: `Download original file`,
            icon: <CloudDownload />,
            target: fullPage ? null : '_blank',
        });
    }

    const ocrData = Object.keys(data.content.ocrtext || {}).map((tag, index) => {
        return {tag: tag, text: data.content.ocrtext[tag]};
    });

    headerLinks.push(
        ...ocrData.map(({tag}) => {
            return {
                href: api.ocrUrl(digestUrl, tag),
                text: `OCR ${tag}`,
                icon: <ChromeReaderMode />,
            };
        })
    )

    return (
        <div>
            {headerLinks.length > 0 && showToolbar !== false && (
                <Toolbar classes={{root: classes.toolbar}}>
                    {headerLinks.map(({text, icon, ...props}) => (
                        <Tooltip title={text} key={props.href}>
                            <IconButton
                                size="small"
                                color="default"
                                component="a"
                                {...props}>
                                {icon}
                            </IconButton>
                        </Tooltip>
                    ))}
                </Toolbar>
            )}

            <EmailSection doc={data} collection={collection} />

            <PreviewSection
                title="Preview"
                docTitle={data.content.filename}
                type={data.content["content-type"]}
                url={docRawUrl}
            />

            <HTMLSection
                html={data.safe_html}
                title="HTML"
            />

            <TextSection
                title="Text"
                text={data.content.text}
                fullPage={fullPage}
            />

            <TextSection
                title="Headers &amp; Parts"
                text={data.content.tree}
                fullPage={fullPage}
            />

            {ocrData.map(({tag, text}) => (
                <TextSection
                    key={tag}
                    title={"OCR " + tag}
                    text={text}
                    fullPage={fullPage}
                    omitIfEmpty={false}
                />
            ))}

            <FilesSection
                title="Files"
                data={data.children || []}
                page={data.children_page}
                hasNextPage={data.children_has_next_page}
                fullPage={fullPage}
                docUrl={docUrl}
                baseUrl={collectionBaseUrl}
            />

            {showMeta && (
                <MetaSection
                    doc={data}
                    collection={collection}
                    baseUrl={collectionBaseUrl}
                />
            )}
        </div>
    )
}

export default memo(Document)
