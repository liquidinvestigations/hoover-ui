import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import url from 'url'
import { IconButton, Toolbar, Tooltip } from '@material-ui/core'
import { ChromeReaderMode, CloudDownload, Launch, Print } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'
import api from '../../api'
import Loading from '../Loading'
import EmailSection from './EmailSection'
import PreviewSection from './PreviewSection'
import HTMLSection from './HTMLSection'
import TextSection from './TextSection'
import FilesSection from './FilesSection'
import MetaSection from './MetaSection'

const useStyles = makeStyles(theme => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        justifyContent: 'space-between',
    },
}))

Document.propTypes = {
    showToolbar: PropTypes.bool,
    showMeta: PropTypes.bool,
}

Document.defaultProps = {
    showToolbar: true,
    showMeta: true,
}

function Document({ docUrl, collection, data, fullPage, isFetching, showToolbar, showMeta }) {
    const classes = useStyles()

    if (isFetching) {
        return <Loading/>
    }

    if (!data || !Object.keys(data).length) {
        return null
    }

    const collectionBaseUrl = url.resolve(docUrl, './');

    const files = data.children || [];
    const headerLinks = [];

    let digest = data.id;
    let docRawUrl = api.downloadUrl(`${collectionBaseUrl}${digest}`, data.content.filename);

    if (data.id.startsWith('_file_')) {
        digest = data.digest;
        docRawUrl = api.downloadUrl(`${collectionBaseUrl}${digest}`, data.content.filename);
    }

    if (data.id.startsWith('_directory_')) {
        digest = null;
        docRawUrl = null;
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
                href: api.ocrUrl(docUrl, tag),
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

            <EmailSection doc={data} />

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
                    title={"OCR " + tag}
                    text={text}
                    fullPage={fullPage}
                    omitIfEmpty={false}
                />
            ))}

            <FilesSection
                title="Files"
                data={files}
                fullPage={fullPage}
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

const mapStateToProps = ({ doc: { isFetching, data, url, collection } }) => ({
    isFetching,
    data,
    docUrl: url,
    collection,
})

export default connect(mapStateToProps)(Document)
