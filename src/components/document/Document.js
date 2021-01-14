import React, { memo, useEffect, useState } from 'react'
import url from 'url'
import { makeStyles } from '@material-ui/core/styles'
import {
    ChromeReaderMode,
    CloudDownload,
    DeleteOutlined,
    Error,
    ErrorOutline,
    Launch,
    Print,
    RestoreFromTrash,
    Star,
    StarOutline,
    Visibility,
    VisibilityOffOutlined
} from '@material-ui/icons'
import { IconButton, Toolbar, Tooltip } from '@material-ui/core'
import { brown, green, grey, red } from '@material-ui/core/colors'
import EmailSection from './EmailSection'
import PreviewSection from './PreviewSection'
import HTMLSection from './HTMLSection'
import TextSection from './TextSection'
import FilesSection from './FilesSection'
import MetaSection from './MetaSection'
import Loading from '../Loading'
import TagsSection, { publicTags } from './TagsSection'
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
    const tagsLinks = []

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
    const [tagsLocked, setTagsLocked] = useState(false)

    useEffect(() => {
        if (digestUrl && !digestUrl.includes('_file_') && !digestUrl.includes('_directory_')) {
            setTagsLoading(true)
            setTagsLocked(true)
            tagsAPI(digestUrl).then(data => {
                setTags(data)
                setTagsLoading(false)
                setTagsLocked(false)
            })
        }
    }, [digestUrl])

    if (loading) {
        return <Loading />
    }

    if (!docUrl || !data || !Object.keys(data).length) {
        return null
    }

    const handleSpecialTagClick = (tag, name) => event => {
        event.stopPropagation()
        setTagsLocked(true)
        if (tag) {
            deleteTag(digestUrl, tag.id).then(() => {
                setTags([...(tags.filter(t => t.id !== tag.id))])
                setTagsLocked(false)
            }).catch(() => {
                setTagsLocked(false)
            })
        } else {
            createTag(digestUrl, { tag: name, public: publicTags.includes(name) }).then(newTag => {
                setTags([...tags, newTag])
                setTagsLocked(false)
            }).catch(() => {
                setTagsLocked(false)
            })
        }
    }

    if (!fullPage) {
        headerLinks.push({
            href: docUrl,
            tooltip: 'Open in new tab',
            icon: <Launch />,
            target: '_blank',
        })
    }

    if (data.content.filetype !== 'folder') {
        const important = tags.find(tag => tag.tag === 'important')
        headerLinks.push({
            icon: important ? <Star /> : <StarOutline />,
            style: { color: important ? '#ffb400' : grey[600] },
            tooltip: important ? 'Unmark important' : 'Mark important',
            disabled: tagsLocked,
            onClick: handleSpecialTagClick(important, 'important')
        })

        headerLinks.push({
            href: `${docUrl}?print=true`,
            tooltip: 'Print metadata and content',
            icon: <Print />,
            target: '_blank',
        })

        headerLinks.push({
            href: docRawUrl,
            tooltip: 'Download original file',
            icon: <CloudDownload />,
            target: fullPage ? null : '_blank',
        })

        const interesting = tags.find(tag => tag.tag === 'interesting')
        tagsLinks.push({
            icon: interesting ? <Error /> : <ErrorOutline />,
            style: { color: interesting ? green[500] : grey[600] },
            tooltip: 'Mark this document with a public tag so others will see it. ' +
                'You can exclude these documents by clicking on the "Public Tags" filter on the left.',
            label: interesting ? 'interesting' : 'not interesting',
            disabled: tagsLocked,
            onClick: handleSpecialTagClick(interesting, 'interesting')
        })

        const seen = tags.find(tag => tag.tag === 'seen')
        tagsLinks.push({
            icon: seen ? <Visibility /> : <VisibilityOffOutlined />,
            style: { color: seen ? brown[500] : grey[600] },
            tooltip: 'You can exclude these documents by clicking on the "Private Tags" filter on the left.',
            label: seen ? 'seen' : 'not seen',
            disabled: tagsLocked,
            onClick: handleSpecialTagClick(seen, 'seen')
        })

        const trash = tags.find(tag => tag.tag === 'trash')
        tagsLinks.push({
            icon: trash ? <RestoreFromTrash /> : <DeleteOutlined />,
            style: { color: trash ? red[600] : grey[600] },
            tooltip: 'By default, documents with the tag "trash" will be excluded from searches. ' +
                'You can override this by clicking on the "Private Tags" filter on the left.',
            label: trash ? 'trash' : 'not trash',
            disabled: tagsLocked,
            onClick: handleSpecialTagClick(trash, 'trash')
        })
    }

    const ocrData = Object.keys(data.content.ocrtext || {}).map((tag, index) => {
        return {tag: tag, text: data.content.ocrtext[tag]}
    })

    headerLinks.push(
        ...ocrData.map(({tag}) => {
            return {
                href: createOcrUrl(digestUrl, tag),
                tooltip: `OCR ${tag}`,
                icon: <ChromeReaderMode />,
                target: fullPage ? null : '_blank',
            }
        })
    )

    return (
        <div>
            {headerLinks.length > 0 && showToolbar !== false && (
                <Toolbar classes={{root: classes.toolbar}}>
                    {headerLinks.map(({tooltip, icon, ...props}, index) => (
                        <Tooltip title={tooltip} key={index}>
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
                onChanged={setTags}
                toolbarButtons={tagsLinks}
                locked={tagsLocked}
                onLocked={setTagsLocked}
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
