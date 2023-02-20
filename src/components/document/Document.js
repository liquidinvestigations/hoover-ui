import { Badge, Box, Button, Chip, Grid, Tabs, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'
import { cloneElement, useEffect } from 'react'

import { createOcrUrl } from '../../backend/api'
import { reactIcons } from '../../constants/icons'
import { specialTags } from '../../constants/specialTags'
import { getTagIcon } from '../../utils/utils'
import Loading from '../Loading'
import { useSharedStore } from '../SharedStoreProvider'

import { HTML } from './HTML'
import { Meta } from './Meta'
import StyledTab from './StyledTab'
import { SubTabs } from './SubTabs'
import { TabPanel } from './TabPanel'
import { Tags, getChipColor } from './Tags'
import { useTags } from './TagsProvider'
import { TagTooltip } from './TagTooltip'
import { Text } from './Text'
import Toolbar from './Toolbar'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
    header: {
        backgroundColor: theme.palette.primary.main,
    },
    titleWrapper: {
        overflow: 'hidden',
    },
    filename: {
        padding: theme.spacing(1),
        paddingBottom: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: theme.palette.primary.contrastText,
    },
    subtitle: {
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
    thumbnail: {
        padding: theme.spacing(1),
        paddingBottom: 0,
    },
    thumbnailImg: {
        height: 72,
        maxWidth: 100,
    },
    tabsRoot: {
        minHeight: 65,
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
    },
}))

export const Document = observer(({ onPrev, onNext }) => {
    const classes = useStyles()

    const {
        user,
        fullPage,
        printMode,
        documentStore: { data, pathname, loading, collection, digestUrl, docRawUrl, thumbnailSrcSet, tab, handleTabChange },
    } = useSharedStore()

    const { tags, tagsLoading, tagsLocked, handleSpecialTagClick } = useTags()

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

    const ocrData = Object.keys(data.content.ocrtext || {}).map((tag) => {
        return { tag: tag, text: data.content.ocrtext[tag] }
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
            ...ocrData.map(({ tag }) => ({
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
            const present = tags.find((current) => current.tag === tag && current.public === params.public && current.user === user.username)
            const count =
                tags.filter((current) => current.tag === tag && current.public === params.public && current.user !== user.username)?.length || null
            const link = {
                icon: present ? reactIcons[params.present.icon] : reactIcons[params.absent.icon],
                label: present ? params.present.label : params.absent.label,
                style: { color: present ? params.present.color : params.absent.color },
                tooltip: params.tooltip,
                disabled: tagsLocked,
                onClick: handleSpecialTagClick(present, tag),
                count: present && count ? count + 1 : count,
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

    const tabsData = [
        {
            name: data.content.filetype,
            icon: reactIcons.contentTab,
            visible: true,
            padding: 0,
            content: <SubTabs />,
        },
        {
            name: 'Tags',
            icon: reactIcons.tagsTab,
            visible: !printMode && data.content.filetype !== 'folder',
            content: <Tags toolbarButtons={tagsLinks} />,
        },
        {
            name: 'Meta',
            icon: reactIcons.metaTab,
            visible: !printMode,
            content: <Meta />,
        },
        {
            name: 'HTML',
            icon: reactIcons.codeTab,
            visible: !!data.safe_html,
            content: <HTML html={data.safe_html} />,
        },
        {
            name: 'Headers & Parts',
            icon: reactIcons.headersTab,
            visible: !!data.content.tree,
            content: <Text content={data.content.tree} />,
        },
    ]

    // TODO replace with styling
    const emptyTabs = []
    for (let i = 0; i < 10; i++) {
        emptyTabs.push(<StyledTab key={i} disabled />)
    }

    const uploadButton = () => {
        return (
            <Button
                key={'Upload'}
                startIcon={reactIcons.download}
                variant="text"
                component="a"
                href={'/upload/' + collection + '/' + data.id}
                color="inherit">
                {'Upload File'}
            </Button>
        )
    }

    return (
        <div className={classes.root} data-test="doc-view">
            {!printMode && data.content.filetype !== 'folder' && <Toolbar links={headerLinks} />}

            {printMode && (
                <Link href={pathname} className={classes.printBackLink}>
                    ← Back to <b>normal view</b>
                </Link>
            )}

            <Grid container justifyContent="space-between" wrap="nowrap" className={classes.header}>
                <Grid item className={classes.titleWrapper}>
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

                        {tags
                            .filter((item, pos, self) => self.findIndex((tag) => tag.tag === item.tag) === pos)
                            .map((chip, index) => {
                                const count = tags.filter((tag) => tag.tag === chip.tag).length
                                return (
                                    <Grid item className={classes.tag} key={index}>
                                        <TagTooltip chip={chip} count={count}>
                                            <Badge badgeContent={count > 1 ? count : null} color="secondary">
                                                <Chip
                                                    size="small"
                                                    label={
                                                        !!getTagIcon(chip.tag, chip.public) ? (
                                                            <>
                                                                {cloneElement(getTagIcon(chip.tag, chip.public), {
                                                                    style: {
                                                                        ...getTagIcon(chip.tag, chip.public).props.style,
                                                                        marginLeft: -4,
                                                                        marginTop: -2,
                                                                        marginRight: 2,
                                                                        fontSize: 18,
                                                                        verticalAlign: 'middle',
                                                                    },
                                                                })}
                                                                <span style={{ verticalAlign: 'middle' }}>{chip.tag}</span>
                                                            </>
                                                        ) : (
                                                            chip.tag
                                                        )
                                                    }
                                                    style={{
                                                        height: 20,
                                                        backgroundColor: getChipColor(chip),
                                                    }}
                                                />
                                            </Badge>
                                        </TagTooltip>
                                    </Grid>
                                )
                            })}
                    </Grid>
                </Grid>

                {data.content['has-thumbnails'] && (
                    <Grid item>
                        <Box className={classes.thumbnail}>
                            <img className={classes.thumbnailImg} srcSet={thumbnailSrcSet} alt="thumbnail" />
                        </Box>
                    </Grid>
                )}
            </Grid>

            {!printMode && (
                <Tabs value={tab} onChange={handleTabChange} classes={tabsClasses} variant="scrollable" scrollButtons="auto" indicatorColor="secondary">
                    {tabsData
                        .filter((tabData) => tabData.visible)
                        .map((tabData, index) => (
                            <StyledTab key={index} icon={tabData.icon} label={tabData.name} />
                        ))}
                    {data.content.filetype === 'folder' &&
                        !data.content.path.includes('//') &&
                        process.env.HOOVER_UPLOADS_ENABLED && [...emptyTabs, uploadButton()]}
                </Tabs>
            )}

            {tabsData
                .filter((tabData) => tabData.visible)
                .map((tabData, index) => (
                    <Box key={index} className={index === tab ? classes.activeTab : null}>
                        {printMode && (
                            <Typography variant="h3" className={classes.printTitle}>
                                {tabData.name}
                            </Typography>
                        )}
                        <TabPanel value={tab} index={index} padding={tabData.padding} alwaysVisible={printMode}>
                            {tabData.content}
                        </TabPanel>
                    </Box>
                ))}
        </div>
    )
})
