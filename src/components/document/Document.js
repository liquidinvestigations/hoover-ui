import React, { memo, useEffect } from 'react'
import Link from 'next/link'
import { makeStyles } from '@material-ui/core/styles'
import { AccountTreeOutlined, CodeOutlined, LocalOfferOutlined, SettingsApplicationsOutlined, Toc } from '@material-ui/icons'
import { Badge, Box, Chip, Grid, Tabs, Typography } from '@material-ui/core'
import Toolbar from './Toolbar'
import StyledTab from './StyledTab'
import TabPanel from './TabPanel'
import HTML from './HTML'
import Text from './Text'
import Meta from './Meta'
import Loading from '../Loading'
import TagTooltip from './TagTooltip'
import SubTabs from './SubTabs'
import Tags, { getChipColor } from './Tags'
import { useDocument } from './DocumentProvider'
import { useTags } from './TagsProvider'

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
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
    },
}))

function Document({ onPrev, onNext }) {
    const classes = useStyles()

    const { data, pathname, loading, printMode, collection, tab, handleTabChange } = useDocument()
    const { tags, tagsLoading } = useTags()

    useEffect(() => {
        if (printMode && !loading && !tagsLoading) {
            window.setTimeout(window.print)
        }
    }, [printMode, loading, tagsLoading])

    if (loading) {
        return <Loading />
    }

    if (!pathname || !data || !Object.keys(data).length) {
        return null
    }

    const tabsClasses = {
        root: classes.tabsRoot,
        indicator: classes.tabsIndicator,
    }

    const tabsData = [{
        name: data.content.filetype,
        icon: <Toc />,
        visible: true,
        padding: 0,
        content: <SubTabs />,
    },{
        name: 'Tags',
        icon: <LocalOfferOutlined />,
        visible: !printMode && data.content.filetype !== 'folder',
        content: <Tags />,
    },{
        name: 'Meta',
        icon: <SettingsApplicationsOutlined />,
        visible: !printMode,
        content: <Meta />,
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
            {!printMode && data.content.filetype !== 'folder' && <Toolbar onPrev={onPrev} onNext={onNext} />}

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
