import React, { memo, useEffect, useState } from 'react'
import url from 'url'
import { makeStyles } from '@material-ui/core/styles'
import {
    ChromeReaderMode,
    CloudDownload,
    Delete,
    Drafts,
    Launch,
    Markunread,
    Print,
    RestoreFromTrash,
    Star,
    StarOutline
} from '@material-ui/icons'
import { IconButton, Toolbar, Tooltip } from '@material-ui/core'
import EmailSection from './EmailSection'
import PreviewSection from './PreviewSection'
import HTMLSection from './HTMLSection'
import TextSection from './TextSection'
import FilesSection from './FilesSection'
import MetaSection from './MetaSection'
import Loading from '../Loading'
import TagsSection from './TagsSection'
import { createDownloadUrl, createOcrUrl, createTag, deleteTag, tags as tagsAPI } from '../../backend/api'

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
    const [, collection] = url?.match(/(?:^|\/)doc\/(.+?)\//) || [];
    return collection;
}

function Document({ docUrl, data, loading, fullPage, showToolbar = true, showMeta = true }) {
    const classes = useStyles()

    let digestUrl = docUrl

    const collection = parseCollection(docUrl)
    const collectionBaseUrl = docUrl && url.resolve(docUrl, './')
    const headerLinks = []

    let digest = data?.id
    let docRawUrl = createDownloadUrl(`${collectionBaseUrl}${digest}`, data?.content.filename)

    if (data?.id.startsWith('_file_')) {
        digest = data.digest
        digestUrl = [url.resolve(docUrl, './'), data.digest].join('/')
        docRawUrl = createDownloadUrl(`${collectionBaseUrl}${digest}`, data.content.filename)
    }

    if (data?.id.startsWith('_directory_')) {
        digest = null
        digestUrl = null
        docRawUrl = null
    }

    const [tags, setTags] = useState([])
    const [tagsLoading, setTagsLoading] = useState(false)
    const [importantLock, setImportantLock] = useState(false)
    const [seenLock, setSeenLock] = useState(false)
    const [trashLock, setTrashLock] = useState(false)
    useEffect(() => {
        if (digestUrl && !digestUrl.includes('_file_') && !digestUrl.includes('_directory_')) {
            setTagsLoading(true)
            setImportantLock(true)
            setSeenLock(true)
            setTrashLock(true)
            tagsAPI(digestUrl).then(data => {
                setTags(data)
                setTagsLoading(false)
                setImportantLock(false)
                setSeenLock(false)
                setTrashLock(false)
            })
        }
    }, [digestUrl])

    if (loading) {
        return <Loading />
    }

    if (!docUrl || !data || !Object.keys(data).length) {
        return null
    }

    const handleSpecialTagClick = (tag, name, onLoading) => () => {
        setImportantLock(true)
        if (tag) {
            deleteTag(digestUrl, tag.id).then(() => {
                setTags([...(tags.filter(t => t.id !== tag.id))])
                onLoading(false)
            }).catch(() => {
                onLoading(false)
            })
        } else {
            createTag(digestUrl, { tag: name, public: false }).then(newTag => {
                setTags([...tags, newTag])
                onLoading(false)
            }).catch(() => {
                onLoading(false)
            })
        }
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
        const important = tags.find(tag => tag.tag === 'important')
        headerLinks.push({
            icon: important ? <Star /> : <StarOutline />,
            style: { color: '#ffb400' },
            text: important ? 'Unmark important' : 'Mark important',
            disabled: importantLock,
            onClick: handleSpecialTagClick(important, 'important', setImportantLock)
        })

        const seen = tags.find(tag => tag.tag === 'seen')
        headerLinks.push({
            icon: seen ? <Drafts /> : <Markunread />,
            text: seen ? 'Unmark seen' : 'Mark seen',
            disabled: seenLock,
            onClick: handleSpecialTagClick(seen, 'seen', setSeenLock)
        })

        const trash = tags.find(tag => tag.tag === 'trash')
        headerLinks.push({
            icon: trash ? <RestoreFromTrash /> : <Delete />,
            text: trash ? 'Restore from trash' : 'Mark trashed',
            disabled: trashLock,
            onClick: handleSpecialTagClick(trash, 'trash', setTrashLock)
        })

        headerLinks.push({
            href: `${docUrl}?print=true`,
            text: 'Print metadata and content',
            icon: <Print />,
            target: '_blank',
        });

        headerLinks.push({
            href: docRawUrl,
            text: 'Download original file',
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
                href: createOcrUrl(digestUrl, tag),
                text: `OCR ${tag}`,
                icon: <ChromeReaderMode />,
                target: fullPage ? null : '_blank',
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

            <TagsSection
                loading={tagsLoading}
                digestUrl={digestUrl}
                tags={tags}
                onTagsChanged={setTags}
            />

            <EmailSection doc={data} collection={collection} />

            <PreviewSection
                docTitle={data.content.filename}
                type={data.content["content-type"]}
                url={docRawUrl}
            />

            <HTMLSection html={data.safe_html} />

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
