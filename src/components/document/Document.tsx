import { Badge, Box, Button, Chip, Grid, Tabs, Tooltip, Typography } from '@mui/material'
import { observer } from 'mobx-react-lite'
import Link from 'next/link'
import { cloneElement, ReactElement, useEffect, useRef, useState } from 'react'

import { createOcrUrl } from '../../backend/api'
import { reactIcons } from '../../constants/icons'
import { specialTags } from '../../constants/specialTags'
import { Tag } from '../../stores/TagsStore'
import { getTagIcon } from '../../utils/utils'
import { Loading } from '../common/Loading/Loading'
import { PageSearch } from '../common/PageSearch/PageSearch'
import { Finder } from '../finder/Finder'
import Locations from '../Locations'
import { useSharedStore } from '../SharedStoreProvider'

import { useStyles } from './Document.styles'
import { StyledTab } from './StyledTab'
import { HTML } from './SubTabs/components/HTML'
import { Meta } from './SubTabs/components/Meta/Meta'
import { PdfTab } from './SubTabs/components/Preview/PdfTab'
import { PREVIEWABLE_MIME_TYPE_SUFFEXES } from './SubTabs/components/Preview/Preview'
import { getChipColor, Tags } from './SubTabs/components/Tags/Tags'
import { TagTooltip } from './SubTabs/components/Tags/TagTooltip'
import { Text } from './SubTabs/components/Text/Text'
import { SubTabs } from './SubTabs/SubTabs'
import { TabPanel } from './TabPanel/TabPanel'
import { Toolbar, ToolbarLink } from './Toolbar/Toolbar'

export const Document = observer(() => {
    const { classes } = useStyles()
    const containerRef = useRef<HTMLDivElement>(null)

    const {
        user,
        fullPage,
        printMode,
        tagsStore: { tags, tagsLoading, tagsLocked, handleSpecialTagClick },
        documentStore: {
            data,
            pathname,
            loading,
            collection,
            digestUrl,
            docRawUrl,
            thumbnailSrcSet,
            tab,
            handleTabChange,
            documentSearchStore: { query, metaSearchStore, textSearchStore, pdfSearchStore },
        },
        searchStore: {
            searchResultsStore: { previewNextDoc, previewPreviousDoc },
        },
    } = useSharedStore()

    useEffect(() => {
        if (printMode && !loading && !tagsLoading) {
            window.setTimeout(window.print)
        }
    }, [printMode, loading, tagsLoading])

    const headerLinks = {
        actions: [] as ToolbarLink[],
        navigation: [] as ToolbarLink[],
        tags: [] as ToolbarLink[],
    }

    const tagsLinks = [] as ToolbarLink[]

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
            target: fullPage ? undefined : '_blank',
        })

        headerLinks.actions.push(
            ...ocrData.map(({ tag }) => ({
                href: createOcrUrl(digestUrl || '', tag),
                tooltip: `OCR ${tag}`,
                icon: reactIcons.ocr,
                target: fullPage ? undefined : '_blank',
            }))
        )

        if (previewNextDoc) {
            headerLinks.navigation.push({
                icon: reactIcons.chevronLeft,
                tooltip: 'Previous result',
                onClick: previewNextDoc,
            })
        }

        if (previewPreviousDoc) {
            headerLinks.navigation.push({
                icon: reactIcons.chevronRight,
                tooltip: 'Next result',
                onClick: previewPreviousDoc,
            })
        }

        Object.entries(specialTags).forEach(([tag, params]) => {
            const present = tags.find((current: Tag) => current.tag === tag && current.public === params.public && current.user === user?.username)
            const count =
                tags.filter((current: Tag) => current.tag === tag && current.public === params.public && current.user !== user?.username)?.length || 0
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

    const hasPreview =
        data.content['has-pdf-preview'] ||
        (docRawUrl && data.content['content-type'] && PREVIEWABLE_MIME_TYPE_SUFFEXES.some((x) => data.content['content-type'].endsWith(x)))

    const tabsData = [
        {
            name: data.content.filetype,
            icon: reactIcons.contentTab,
            visible: hasPreview,
            padding: 0,
            content: <PdfTab />,
            searchLoading: pdfSearchStore.loading && !pdfSearchStore.getTotalSearchResultsCount(),
            searchCount: pdfSearchStore.getTotalSearchResultsCount(),
        },
        {
            name: 'Text',
            icon: reactIcons.content,
            visible: true,
            padding: 0,
            content: <SubTabs />,
            searchLoading: textSearchStore.loading,
            searchCount: textSearchStore.getTotalSearchResultsCount(),
        },
        {
            name: 'Tags',
            icon: reactIcons.tagsTab,
            visible: !printMode && data.content.filetype !== 'folder',
            content: <Tags toolbarButtons={tagsLinks} />,
        },
        {
            name: 'Location',
            icon: reactIcons.location,
            visible: !fullPage,
            content: (
                <>
                    <Finder />
                    <Locations data={data} url={digestUrl} />
                </>
            ),
        },
        {
            name: 'Meta',
            icon: reactIcons.metaTab,
            visible: !printMode,
            content: <Meta />,
            searchLoading: metaSearchStore.loading,
            searchCount: metaSearchStore.getSearchResultsCount(),
        },
        {
            name: 'HTML',
            icon: reactIcons.codeTab,
            visible: !!data.safe_html,
            content: <HTML html={data.safe_html || ''} />,
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

    const getSearchCount = (tabData: any, index: number) => {
        if (!query || query.length < 3) return undefined
        if (!tabData.hasOwnProperty('searchLoading')) return undefined
        return (
            <span className={classes.searchCount}>
                {tabData.searchLoading ? (
                    <Loading size={12} sx={{ color: index === tab ? '' : 'inherit' }} />
                ) : (
                    <span className={`total-count${!tabData.searchCount ? ' no-results' : ''}`}>{tabData.searchCount}</span>
                )}
            </span>
        )
    }

    return (
        <div ref={containerRef} className={classes.root} data-test="doc-view" tabIndex={0}>
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
                            {data.content?.filename?.[0] ?? ''}
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
                                                                {cloneElement(getTagIcon(chip.tag, chip.public) as ReactElement, {
                                                                    style: {
                                                                        ...(getTagIcon(chip.tag, chip.public) as ReactElement).props.style,
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

            <Box className={classes.header}>
                <PageSearch />
            </Box>

            {!printMode && (
                <Tabs value={tab} onChange={handleTabChange} classes={tabsClasses} variant="scrollable" scrollButtons="auto" indicatorColor="secondary">
                    {tabsData
                        .filter((tabData) => tabData.visible)
                        .map((tabData, index) => (
                            <StyledTab
                                key={index}
                                icon={tabData.icon}
                                label={
                                    <>
                                        {tabData.name}
                                        {getSearchCount(tabData, index)}
                                    </>
                                }
                            />
                        ))}
                    {data.content.filetype === 'folder' &&
                        !data.content.path.includes('//') &&
                        process.env.HOOVER_UPLOADS_ENABLED && [...emptyTabs, uploadButton()]}
                </Tabs>
            )}

            {tabsData
                .filter((tabData) => tabData.visible)
                .map((tabData, index) => (
                    <Box key={index} className={index === tab ? `${classes.activeTab} activeTab` : undefined}>
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
