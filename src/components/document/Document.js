import React, { memo, useEffect, useState } from 'react'
import Link from 'next/link'
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
import { Box, Chip, Grid, IconButton, Tab, Tabs, Toolbar, Tooltip, Typography } from '@material-ui/core'
import { brown, green, grey, red } from '@material-ui/core/colors'
import StyledTab from './StyledTab'
import TabPanel from './TabPanel'
import Email from './Email'
import Preview, { PREVIEWABLE_MIME_TYPE_SUFFEXES } from './Preview'
import HTML from './HTML'
import Text from './Text'
import Files from './Files'
import Meta from './Meta'
import Loading from '../Loading'
import Tags, { publicTags, specialTags } from './Tags'
import { createDownloadUrl, createOcrUrl, createTag, deleteTag, tags as tagsAPI } from '../../backend/api'

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
    filename: {
        padding: theme.spacing(1),
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
    },
    tags: {
        backgroundColor: theme.palette.primary.main,
        padding: theme.spacing(1),
        paddingTop: theme.spacing(0.5),
    },
    tag: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
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
    printTitle: {
        margin: theme.spacing(2),
    },
    printBackLink: {
        float: 'right',
        margin: theme.spacing(1),
        color: theme.palette.primary.contrastText,
    }
}))

const parseCollection = url => {
    const [, collection] = url?.match(/(?:^|\/)doc\/(.+?)\//) || [];
    return collection;
}

function Document({ docUrl, data, loading, onPrev, onNext, printMode, fullPage }) {
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
    const [tagsLoading, setTagsLoading] = useState(true)
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

    useEffect(() => {
        if (printMode && !loading && !tagsLoading) {
            window.setTimeout(window.print)
        }
    }, [printMode, loading, tagsLoading])

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
        const starred = tags.find(tag => tag.tag === 'starred')
        headerLinks.push({
            icon: starred ? <Star /> : <StarOutline />,
            style: { color: starred ? '#ffb400' : grey[600] },
            tooltip: starred ? 'Unmark starred' : 'Mark starred',
            disabled: tagsLocked,
            onClick: handleSpecialTagClick(starred, 'starred')
        })

        const recommended = tags.find(tag => tag.tag === 'recommended')
        headerLinks.push({
            icon: recommended ? <Error /> : <ErrorOutline />,
            style: { color: recommended ? green[500] : grey[600] },
            tooltip: recommended ? 'Unmark recommended' : 'Mark recommended',
            label: recommended ? 'recommended' : 'not recommended',
            disabled: tagsLocked,
            className: classes.lastIconOnLeft,
            onClick: handleSpecialTagClick(recommended, 'recommended')
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

    const tabsData = [{
        name: 'Text',
        icon: <Subject />,
        visible: true,
        content: <Text content={data.content.text} />,
    },{
        name: 'Preview',
        icon: <PageviewOutlined />,
        visible: hasPreview,
        content: <Preview
            docTitle={data.content.filename}
            type={data.content['content-type']}
            url={docRawUrl}
        />,
    },{
        name: 'Tags',
        icon: <LocalOfferOutlined />,
        visible: data.content.filetype !== 'folder',
        content: <Tags
            loading={tagsLoading}
            digestUrl={digestUrl}
            tags={tags}
            onChanged={setTags}
            toolbarButtons={tagsLinks}
            locked={tagsLocked}
            onLocked={setTagsLocked}
            printMode={printMode}
        />,
    },{
        name: 'Meta',
        icon: <SettingsApplicationsOutlined />,
        visible: true,
        content: <Meta
            doc={data}
            collection={collection}
            baseUrl={collectionBaseUrl}
            printMode={printMode}
        />,
    },{
        name: 'Email',
        icon: <EmailOutlined />,
        visible: data.content.filetype === 'email',
        content: <Email
            doc={data}
            collection={collection}
            printMode={printMode}
        />,
    },{
        name: 'HTML',
        icon: <CodeOutlined />,
        visible: !!data.safe_html,
        content: <HTML html={data.safe_html} />,
    },{
        name: 'Headers & Parts',
        icon: <AccountTreeOutlined />,
        visible: !!data.content.tree,
        content: <Text content={data.content.tree} />,
    },{
        name: 'Files',
        icon: <FolderOutlined />,
        visible: !!data.children?.length,
        content: <Files
            data={data.children}
            page={data.children_page}
            hasNextPage={data.children_has_next_page}
            fullPage={fullPage}
            docUrl={docUrl}
            baseUrl={collectionBaseUrl}
        />
    }]

    return (
        <div>
            {headerLinks.length > 0 && !printMode && (
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

            {printMode && (
                <Link href={docUrl}>
                    <a className={classes.printBackLink}>← Back to <b>normal view</b></a>
                </Link>
            )}

            <Typography variant="h5" className={classes.filename}>
                {data.content.filename}
            </Typography>

            {!!tags.length && (
                <Grid container className={classes.tags}>
                    {tags.map(({ tag }, index) => (
                        <Grid item className={classes.tag} key={index}>
                            <Chip size="small" label={tag} />
                        </Grid>
                    ))}
                </Grid>
            )}

            {!printMode && (
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    classes={tabsClasses}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabsData.filter(tabData => tabData.visible).map((tabData, index) => (
                        <StyledTab icon={tabData.icon} label={tabData.name} classes={tabClasses} key={index} />
                    ))}

                    {/*ocrData.map(({tag}) => (
                        <TabStyle icon={<TextFields />} label={"OCR " + tag} classes={tabClasses} key={tag} />
                    ))*/}
                </Tabs>
            )}

            {tabsData.filter(tabData => tabData.visible).map((tabData, index) => (
                <Box key={index}>
                    {printMode && <Typography variant="h3" className={classes.printTitle}>{tabData.name}</Typography>}
                    <TabPanel value={tab} index={tabIndex++} alwaysVisible={printMode}>
                        {tabData.content}
                    </TabPanel>
                </Box>
            ))}

            {/*ocrData.map(({tag, text}) => (
                <TabPanel value={tab} index={tabIndex++} key={tag}>
                    <Text content={text} />
                </TabPanel>
            ))*/}
        </div>
    )
}

export default memo(Document)
