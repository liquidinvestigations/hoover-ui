import React, { memo, useContext, useEffect, useState } from 'react'
import Link from 'next/link'
import url from 'url'
import { makeStyles } from '@material-ui/core/styles'
import {
    AccountTreeOutlined,
    CloudDownload,
    CodeOutlined,
    Launch,
    LocalOfferOutlined,
    NavigateBefore,
    NavigateNext,
    PageviewOutlined,
    Print,
    SettingsApplicationsOutlined,
    TextFields,
    Toc
} from '@material-ui/icons'
import { Badge, Box, Chip, Grid, IconButton, Tabs, Toolbar, Tooltip, Typography } from '@material-ui/core'
import StyledTab from './StyledTab'
import TabPanel from './TabPanel'
import Preview, { PREVIEWABLE_MIME_TYPE_SUFFEXES } from './Preview'
import HTML from './HTML'
import Text from './Text'
import Meta from './Meta'
import Loading from '../Loading'
import TagTooltip from './TagTooltip'
import TextSubTabs from './TextSubTabs'
import Tags, { getChipColor } from './Tags'
import { UserContext } from '../../../pages/_app'
import { createDownloadUrl, createOcrUrl, createTag, deleteTag, tags as tagsAPI } from '../../backend/api'
import { publicTagsList, specialTags } from './specialTags'

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
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
        paddingBottom: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
    },
    subtitle: {
        backgroundColor: theme.palette.primary.main,
        padding: theme.spacing(1),
        paddingTop: theme.spacing(0.5),
        alignItems: 'baseline',
    },
    collection: {
        minHeight: 34,
        marginRight: theme.spacing(3),
        color: 'rgba(255,255,255,0.7)',
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
    activeTab: {
        height: '100%',
        overflow: 'auto',
    },
    printTitle: {
        margin: theme.spacing(2),
    },
    printBackLink: {
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        color: theme.palette.primary.contrastText,
        zIndex: theme.zIndex.drawer + 2,
    }
}))

const parseCollection = url => {
    const [, collection] = url?.match(/(?:^|\/)doc\/(.+?)\//) || [];
    return collection;
}

function Document({ docUrl, data, loading, onPrev, onNext, printMode, fullPage }) {
    const classes = useStyles()
    const whoAmI = useContext(UserContext)

    let digestUrl = docUrl

    const collection = parseCollection(docUrl)
    const collectionBaseUrl = docUrl && url.resolve(docUrl, './')
    const headerLinks = {
        actions: [],
        navigation: [],
        tags: [],
    }
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

    const [tab, setTab] = useState(0)
    const handleTabChange = (event, newValue) => setTab(newValue)

    const [tags, setTags] = useState([])
    const [tagsLoading, setTagsLoading] = useState(true)
    const [tagsLocked, setTagsLocked] = useState(false)

    useEffect(() => {
        if (digestUrl && !digestUrl.includes('_file_') && !digestUrl.includes('_directory_')) {
            setTab(0)
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

    const ocrData = Object.keys(data.content.ocrtext || {}).map((tag, index) => {
        return {tag: tag, text: data.content.ocrtext[tag]}
    })

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
            createTag(digestUrl, { tag: name, public: publicTagsList.includes(name) }).then(newTag => {
                setTags([...tags, newTag])
                setTagsLocked(false)
            }).catch(() => {
                setTagsLocked(false)
            })
        }
    }

    if (data.content.filetype !== 'folder') {
        if (!fullPage) {
            headerLinks.actions.push({
                href: docUrl,
                tooltip: 'Open in new tab',
                icon: <Launch />,
                target: '_blank',
            })
        }

        headerLinks.actions.push({
            href: `${docUrl}?print=true`,
            tooltip: 'Print metadata and content',
            icon: <Print />,
            target: '_blank',
        })

        headerLinks.actions.push({
            href: docRawUrl,
            tooltip: 'Download original file',
            icon: <CloudDownload />,
            target: fullPage ? null : '_blank',
        })

        headerLinks.actions.push(
            ...ocrData.map(({tag}) => ({
                href: createOcrUrl(digestUrl, tag),
                tooltip: `OCR ${tag}`,
                icon: <TextFields />,
                target: fullPage ? null : '_blank',
            }))
        )

        if (onPrev) {
            headerLinks.navigation.push({
                icon: <NavigateBefore />,
                tooltip: 'Previous result',
                onClick: onPrev,
            })
        }

        if (onNext) {
            headerLinks.navigation.push({
                icon: <NavigateNext />,
                tooltip: 'Next result',
                onClick: onNext,
            })
        }

        specialTags.forEach(s => {
            const present = tags.find(tag => tag.tag === s.tag && tag.user === whoAmI.username)
            const count = tags.filter(tag => tag.tag === s.tag && tag.user !== whoAmI.username)?.length || null
            const link = {
                icon: present ? s.present.icon : s.absent.icon,
                label: present ? s.present.label : s.absent.label,
                style: { color: present ? s.present.color : s.absent.color },
                tooltip: s.tooltip,
                disabled: tagsLocked,
                onClick: handleSpecialTagClick(present, s.tag),
                count: present && count ? count + 1: count,
            }
            if (s.showInToolbar) {
                headerLinks.tags.push(link)
            }
            if (s.showInTagsTab) {
                tagsLinks.push(link)
            }
        })
    }

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
        name: data.content.filetype,
        icon: <Toc />,
        visible: true,
        padding: 0,
        content: <TextSubTabs
            data={data}
            ocrData={ocrData}
            collection={collection}
            printMode={printMode}
            fullPage={fullPage}
            docUrl={docUrl}
            baseUrl={collectionBaseUrl}
        />,
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
        visible: !printMode && data.content.filetype !== 'folder',
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
        visible: !printMode,
        content: <Meta
            doc={data}
            collection={collection}
            baseUrl={collectionBaseUrl}
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
    }]

    return (
        <div className={classes.root}>
            {!printMode && data.content.filetype !== 'folder' && (
                <Toolbar variant="dense" classes={{root: classes.toolbar}}>
                    {Object.entries(headerLinks).map(([group, links]) => (
                        <Box key={group}>
                            {links.map(({tooltip, icon, count, ...props}, index) => (
                                <Tooltip title={tooltip} key={index}>
                                    <IconButton
                                        size="small"
                                        component="a"
                                        className={classes.toolbarIcons}
                                        {...props}>
                                        <Badge badgeContent={count} color="secondary">
                                            {icon}
                                        </Badge>
                                    </IconButton>
                                </Tooltip>
                            ))}
                        </Box>
                    ))}
                </Toolbar>
            )}

            {printMode && (
                <Link href={docUrl}>
                    <a className={classes.printBackLink}>← Back to <b>normal view</b></a>
                </Link>
            )}

            <Box>
                <Typography variant="h5" className={classes.filename}>
                    {data.content.filename}
                </Typography>
            </Box>

            <Grid container className={classes.subtitle}>
                <Grid item>
                    <Typography variant="subtitle1" className={classes.collection}>
                        {collection}
                    </Typography>
                </Grid>

                {tags.filter((item, pos, self) =>
                    self.findIndex(tag => tag.tag === item.tag) === pos)
                    .map((chip, index) => {
                        const count = tags.filter(tag => tag.tag === chip.tag).length
                        return (
                            <Grid item className={classes.tag} key={index}>
                                <TagTooltip chip={chip} count={count}>
                                    <Badge badgeContent={count > 1 ? count : null} color="secondary">
                                        <Chip
                                            size="small"
                                            label={chip.tag}
                                            style={{
                                                height: 20,
                                                backgroundColor: getChipColor(chip),
                                            }} />
                                    </Badge>
                                </TagTooltip>
                            </Grid>
                        )
                    })
                }
            </Grid>

            {!printMode && (
                <Tabs
                    value={tab}
                    onChange={handleTabChange}
                    classes={tabsClasses}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabsData.filter(tabData => tabData.visible).map((tabData, index) => (
                        <StyledTab
                            key={index}
                            icon={tabData.icon}
                            label={tabData.name}
                            classes={tabClasses}
                        />
                    ))}
                </Tabs>
            )}

            {tabsData.filter(tabData => tabData.visible).map((tabData, index) => (
                <Box
                    key={index}
                    className={index === tab ? classes.activeTab : null}
                >
                    {printMode && (
                        <Typography
                            variant="h3"
                            className={classes.printTitle}
                        >
                            {tabData.name}
                        </Typography>
                    )}
                    <TabPanel
                        value={tab}
                        index={index}
                        padding={tabData.padding}
                        alwaysVisible={printMode}
                    >
                        {tabData.content}
                    </TabPanel>
                </Box>
            ))}
        </div>
    )
}

export default memo(Document)
