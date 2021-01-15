import React, { memo, useEffect, useState } from 'react'
import url from 'url'
import { makeStyles } from '@material-ui/core/styles'
import {
    AccountTreeOutlined,
    CloudDownload,
    CodeOutlined,
    Delete,
    DeleteOutlined,
    EmailOutlined,
    Error,
    ErrorOutline,
    FolderOutlined,
    Launch,
    LocalOfferOutlined,
    NavigateBefore,
    NavigateNext,
    PageviewOutlined,
    Print,
    SettingsApplicationsOutlined,
    Star,
    StarOutline,
    Subject,
    TextFields,
    Visibility,
    VisibilityOffOutlined
} from '@material-ui/icons'
import { IconButton, Tab, Tabs, Toolbar, Tooltip } from '@material-ui/core'
import { brown, green, grey, red } from '@material-ui/core/colors'
import TabPanel from './TabPanel'
import Email from './Email'
import Preview, { PREVIEWABLE_MIME_TYPE_SUFFEXES } from './Preview'
import HTML from './HTML'
import Text from './Text'
import Files from './Files'
import Meta from './Meta'
import Loading from '../Loading'
import Tags, { publicTags } from './Tags'
import { createDownloadUrl, createOcrUrl, createTag, deleteTag, tags as tagsAPI } from '../../backend/api'
import { withStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        justifyContent: 'space-between',
    },
    toolbarIcons: {
        marginRight: theme.spacing(1),
        '&:last-child': {
            marginRight: 0,
        }
    },
    tabsRoot: {
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
    },
    tabsIndicator: {
        top: 0,
    },
    lastIconOnLeft: {
        marginRight: 'auto',
    },
}))

const TabStyle = withStyles((theme) => ({
    root: {
        minWidth: 80,
        '&:hover': {
            opacity: 1,
        },
        '&$selected': {
            color: theme.palette.text.primary,
            backgroundColor: theme.palette.background.default,
        },
    },
    wrapper: {
        flexDirection: 'row',
        '& > *:first-child': {
            marginRight: 6,
            marginBottom: '0 !important',
        }
    },
    labelIcon: {
        minHeight: 48,
    },
    selected: {},
}))((props) => <Tab {...props} />)

const parseCollection = url => {
    const [, collection] = url?.match(/(?:^|\/)doc\/(.+?)\//) || [];
    return collection;
}

function Document({ docUrl, data, loading, onPrev, onNext, fullPage, showToolbar = true }) {
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

    const [tab, setTab] = React.useState(0);

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

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

    if (data.content.filetype !== 'folder') {
        const important = tags.find(tag => tag.tag === 'important')
        headerLinks.push({
            icon: important ? <Star /> : <StarOutline />,
            style: { color: important ? '#ffb400' : grey[600] },
            tooltip: important ? 'Unmark important' : 'Mark important',
            disabled: tagsLocked,
            onClick: handleSpecialTagClick(important, 'important')
        })

        const interesting = tags.find(tag => tag.tag === 'interesting')
        headerLinks.push({
            icon: interesting ? <Error /> : <ErrorOutline />,
            style: { color: interesting ? green[500] : grey[600] },
            tooltip: important ? 'Unmark interesting' : 'Mark interesting',
            label: interesting ? 'interesting' : 'not interesting',
            disabled: tagsLocked,
            className: classes.lastIconOnLeft,
            onClick: handleSpecialTagClick(interesting, 'interesting')
        })

        if (onPrev) {
            headerLinks.push({
                icon: <NavigateBefore />,
                tooltip: 'Previous result',
                onClick: onPrev
            })
        }

        if (onNext) {
            headerLinks.push({
                icon: <NavigateNext />,
                tooltip: 'Next result',
                onClick: onNext
            })
        }

        if (!fullPage) {
            headerLinks.push({
                href: docUrl,
                tooltip: 'Open in new tab',
                icon: <Launch />,
                target: '_blank',
            })
        }

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
            icon: trash ? <Delete /> : <DeleteOutlined />,
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
                icon: <TextFields />,
                target: fullPage ? null : '_blank',
            }
        })
    )

    let tabIndex = 0

    const tabsClasses = {
        root: classes.tabsRoot,
        indicator: classes.tabsIndicator,
    }
    const tabClasses = {
        root: classes.tabRoot,
    }

    const hasPreview = docRawUrl && data.content['content-type'] && (
        data.content['content-type'] === 'application/pdf' ||
        PREVIEWABLE_MIME_TYPE_SUFFEXES.some(x => data.content['content-type'].endsWith(x))
    )

    return (
        <div>
            {headerLinks.length > 0 && showToolbar !== false && (
                <Toolbar variant="dense" classes={{root: classes.toolbar}}>
                    {headerLinks.map(({tooltip, icon, ...props}, index) => (
                        <Tooltip title={tooltip} key={index}>
                            <IconButton
                                size="small"
                                component="a"
                                color="default"
                                className={classes.toolbarIcons}
                                {...props}>
                                {icon}
                            </IconButton>
                        </Tooltip>
                    ))}
                </Toolbar>
            )}

            <Tabs
                value={tab}
                onChange={handleTabChange}
                classes={tabsClasses}
                variant="scrollable"
                scrollButtons="auto"
            >
                {!!data.content.text && (
                    <TabStyle icon={<Subject />} label="Text" classes={tabClasses} />
                )}

                {hasPreview && (
                    <TabStyle icon={<PageviewOutlined />} label="Preview" classes={tabClasses} />
                )}

                {data.content.filetype !== 'folder' && (
                    <TabStyle icon={<LocalOfferOutlined />} label="Tags" classes={tabClasses} />
                )}

                {!!data.content && (
                    <TabStyle icon={<SettingsApplicationsOutlined />} label="Meta" classes={tabClasses} />
                )}

                {data.content.filetype === 'email' && (
                    <TabStyle icon={<EmailOutlined />} label="Email" classes={tabClasses} />
                )}

                {!!data.safe_html && (
                    <TabStyle icon={<CodeOutlined />} label="HTML" classes={tabClasses} />
                )}

                {!!data.content.tree && (
                    <TabStyle icon={<AccountTreeOutlined />} label="Headers &amp; Parts" classes={tabClasses} />
                )}

                {ocrData.map(({tag}) => (
                    <TabStyle icon={<TextFields />} label={"OCR " + tag} classes={tabClasses} key={tag} />
                ))}

                {!!data.children?.length && (
                    <TabStyle icon={<FolderOutlined />} label="Files" classes={tabClasses} />
                )}
            </Tabs>

            {!!data.content.text && (
                <TabPanel value={tab} index={tabIndex++}>
                    <Text content={data.content.text} />
                </TabPanel>
            )}

            {hasPreview && (
                <TabPanel value={tab} index={tabIndex++}>
                    <Preview
                        docTitle={data.content.filename}
                        type={data.content["content-type"]}
                        url={docRawUrl}
                    />
                </TabPanel>
            )}

            {data.content.filetype !== 'folder' && (
                <TabPanel value={tab} index={tabIndex++}>
                    <Tags
                        loading={tagsLoading}
                        digestUrl={digestUrl}
                        tags={tags}
                        onChanged={setTags}
                        toolbarButtons={tagsLinks}
                        locked={tagsLocked}
                        onLocked={setTagsLocked}
                    />
                </TabPanel>
            )}

            {!!data.content && (
                <TabPanel value={tab} index={tabIndex++}>
                    <Meta
                        doc={data}
                        collection={collection}
                        baseUrl={collectionBaseUrl}
                    />
                </TabPanel>
            )}

            {data.content.filetype === 'email' && (
                <TabPanel value={tab} index={tabIndex++}>
                    <Email doc={data} collection={collection} />
                </TabPanel>
            )}

            {!!data.safe_html && (
                <TabPanel value={tab} index={tabIndex++}>
                    <HTML html={data.safe_html} />
                </TabPanel>
            )}

            {!!data.content.tree && (
                <TabPanel value={tab} index={tabIndex++}>
                    <Text content={data.content.tree} />
                </TabPanel>
            )}

            {ocrData.map(({tag, text}) => (
                <TabPanel value={tab} index={tabIndex++} key={tag}>
                    <Text content={text} />
                </TabPanel>
            ))}

            {!!data.children?.length && (
                <TabPanel value={tab} index={tabIndex++}>
                    <Files
                        data={data.children}
                        page={data.children_page}
                        hasNextPage={data.children_has_next_page}
                        fullPage={fullPage}
                        docUrl={docUrl}
                        baseUrl={collectionBaseUrl}
                    />
                </TabPanel>
            )}
        </div>
    )
}

export default memo(Document)
