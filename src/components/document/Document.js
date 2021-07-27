import React, { cloneElement, memo, useEffect } from 'react'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import { Badge, Box, Chip, Grid, IconButton, Tabs, Toolbar, Tooltip, Typography } from '@material-ui/core'
import StyledTab from './StyledTab'
import TabPanel from './TabPanel'
import HTML from './HTML'
import Text from './Text'
import Meta from './Meta'
import TagTooltip from './TagTooltip'
import SubTabs from './SubTabs'
import Tags, { getChipColor } from './Tags'
import { useDocument } from './DocumentProvider'
import Loading from '../Loading'
import { useUser } from '../UserProvider'
import { createOcrUrl } from '../../backend/api'
import { specialTags } from '../../constants/specialTags'
import { reactIcons } from '../../constants/icons'
import { getTagIcon } from '../../utils'

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
    toolbarIcon: {
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

function Document({ onPrev, onNext }) {
    const classes = useStyles()
    const whoAmI = useUser()

    const {
        data, pathname, loading,
        fullPage, printMode,
        collection,
        digestUrl, docRawUrl,
        tab, handleTabChange,
        tags, tagsLocked, tagsLoading, handleSpecialTagClick
    } = useDocument()

    useEffect(() => {
        if (printMode && !loading && !tagsLoading) {
            window.setTimeout(window.print)
        }
    }, [printMode, loading, tagsLoading])

    const headerLinks = {
        actions: [],
        navigation: [],
        tags: [],
    }

    const tagsLinks = []

    if (loading) {
        return <Loading />
    }

    if (!pathname || !data || !Object.keys(data).length) {
        return null
    }

    const ocrData = Object.keys(data.content.ocrtext || {}).map((tag, index) => {
        return {tag: tag, text: data.content.ocrtext[tag]}
    })

    if (data.content.filetype !== 'folder') {
        if (!fullPage) {
            headerLinks.actions.push({
                href: pathname,
                tooltip: 'Open in new tab',
                icon: reactIcons.openNewTab,
                target: '_blank',
            })
        }

        headerLinks.actions.push({
            href: `${pathname}?print=true`,
            tooltip: 'Print metadata and content',
            icon: reactIcons.print,
            target: '_blank',
        })

        headerLinks.actions.push({
            href: docRawUrl,
            tooltip: 'Download original file',
            icon: reactIcons.download,
            target: fullPage ? null : '_blank',
        })

        headerLinks.actions.push(
            ...ocrData.map(({tag}) => ({
                href: createOcrUrl(digestUrl, tag),
                tooltip: `OCR ${tag}`,
                icon: reactIcons.ocr,
                target: fullPage ? null : '_blank',
            }))
        )

        if (onPrev) {
            headerLinks.navigation.push({
                icon: reactIcons.chevronLeft,
                tooltip: 'Previous result',
                onClick: onPrev,
            })
        }

        if (onNext) {
            headerLinks.navigation.push({
                icon: reactIcons.chevronRight,
                tooltip: 'Next result',
                onClick: onNext,
            })
        }

        Object.entries(specialTags).forEach(([tag, params]) => {
            const present = tags.find(current => current.tag === tag && current.public === params.public && current.user === whoAmI.username)
            const count = tags.filter(current => current.tag === tag && current.public === params.public && current.user !== whoAmI.username)?.length || null
            const link = {
                icon: present ? reactIcons[params.present.icon] : reactIcons[params.absent.icon],
                label: present ? params.present.label : params.absent.label,
                style: { color: present ? params.present.color : params.absent.color },
                tooltip: params.tooltip,
                disabled: tagsLocked,
                onClick: handleSpecialTagClick(present, tag),
                count: present && count ? count + 1: count,
            }
            if (params.showInToolbar) {
                headerLinks.tags.push(link)
            }
            if (params.showInTagsTab) {
                tagsLinks.push(link)
            }
        })
    }

    const tabsClasses = {
        root: classes.tabsRoot,
        indicator: classes.tabsIndicator,
    }

    const tabsData = [{
        name: data.content.filetype,
        icon: reactIcons.contentTab,
        visible: true,
        padding: 0,
        content: <SubTabs />,
    },{
        name: 'Tags',
        icon: reactIcons.tagsTab,
        visible: !printMode && data.content.filetype !== 'folder',
        content: <Tags toolbarButtons={tagsLinks} />,
    },{
        name: 'Meta',
        icon: reactIcons.metaTab,
        visible: !printMode,
        content: <Meta />,
    },{
        name: 'HTML',
        icon: reactIcons.codeTab,
        visible: !!data.safe_html,
        content: <HTML html={data.safe_html} />,
    },{
        name: 'Headers & Parts',
        icon: reactIcons.headersTab,
        visible: !!data.content.tree,
        content: <Text content={data.content.tree} />,
    }]

    return (
        <div className={classes.root} data-test="doc-view">
            {!printMode && data.content.filetype !== 'folder' && (
                <Toolbar variant="dense" classes={{root: classes.toolbar}}>
                    {Object.entries(headerLinks).map(([group, links]) => (
                        <Box key={group}>
                            {links.map(({tooltip, icon, count, ...props}, index) => (
                                <Tooltip title={tooltip} key={index}>
                                    <IconButton
                                        size="small"
                                        component="a"
                                        className={classes.toolbarIcon}
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
                <Link href={pathname}>
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
                                            label={ !!getTagIcon(chip.tag, chip.public) ?
                                                <>
                                                    {cloneElement(getTagIcon(chip.tag, chip.public), {
                                                        style: {
                                                            ...getTagIcon(chip.tag, chip.public).props.style,
                                                            marginLeft: -4,
                                                            marginTop: -2,
                                                            marginRight: 2,
                                                            fontSize: 18,
                                                            verticalAlign: 'middle',
                                                        }
                                                    })}
                                                    <span style={{ verticalAlign: 'middle' }}>
                                                        {chip.tag}
                                                    </span>
                                                </> : chip.tag
                                            }
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
