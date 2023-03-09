import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import cx from 'classnames'
import { cloneElement, createRef, useCallback, useEffect, useRef, useState } from 'react'

import { reactIcons } from '../../constants/icons'
import { Expandable } from '../common/Expandable/Expandable'
import { SplitPaneLayout } from '../common/SplitPaneLayout/SplitPaneLayout'
import Loading from '../Loading'

import AttachmentsView from './AttachmentsView'
import BookmarksView from './BookmarksView'
import { STATUS_COMPLETE, STATUS_ERROR, STATUS_LOADING, useDocument } from './DocumentProvider'
import Page from './Page'
import SideToolbar from './SideToolbar'
import ThumbnailsView from './ThumbnailsView'
import Toolbar from './Toolbar'

const useStyles = makeStyles((theme) => ({
    error: {
        padding: theme.spacing(3),
    },
    viewer: {
        '&:fullscreen': {
            '& $container': {
                height: 'calc(100vh - 48px)',
            },
            '& $fullscreen': {
                display: 'none',
            },
            '& $fullscreenExit': {
                display: 'inline-flex',
            },
        },
    },
    fullscreen: {},
    fullscreenExit: {
        display: 'none',
    },
    container: {
        height: '50vh',
        overflow: 'auto',
        position: 'relative',
        boxSizing: 'content-box',
        backgroundColor: theme.palette.grey[200],

        '& .page': {
            marginBottom: theme.spacing(1),

            '& .svgLayer': {
                position: 'absolute',
                top: 0,
                left: 0,
            },
        },
    },
    externalLinks: {
        overflow: 'auto',
        '& th': {
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },
        '& td': {
            whiteSpace: 'nowrap',
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },
        '& pre': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: theme.spacing(0.5),
            marginBottom: theme.spacing(0.5),
        },
    },
    externalLinksTitle: {
        padding: theme.spacing(2),
    },
    icon: {
        verticalAlign: 'bottom',
        marginRight: theme.spacing(1),
    },
    sidebar: {
        height: '100%',
    },
    sidebarContent: {
        overflowY: 'auto',
        height: 'calc(100% - 48px)',
    },
}))

const pageMargin = 20

export default function Document({ initialPageIndex, onPageIndexChange, renderer = 'canvas' }) {
    const classes = useStyles()
    const { doc, firstPageData, status, error, percent, externalLinks } = useDocument()
    const [rotation, setRotation] = useState(0)
    const [scale, setScale] = useState(1)
    const [currentPageIndex, setCurrentPageIndex] = useState(initialPageIndex)
    const [pagesRefs, setPagesRefs] = useState([])
    const [thumbnailsRefs, setThumbnailsRefs] = useState([])

    const viewerRef = useRef()
    const containerRef = useRef()
    const sidebarRef = useRef()

    const goToPage = useCallback(
        (index) => {
            setCurrentPageIndex(index)
            containerRef.current.scrollTop = pagesRefs[index].current.offsetTop
        },
        [containerRef, pagesRefs]
    )

    useEffect(() => {
        if (doc?.numPages) {
            setPagesRefs((refs) =>
                Array(doc.numPages)
                    .fill()
                    .map((_, i) => refs[i] || createRef())
            )
            setThumbnailsRefs((refs) =>
                Array(doc.numPages)
                    .fill()
                    .map((_, i) => refs[i] || createRef())
            )
        }
    }, [doc])

    useEffect(() => {
        if (firstPageData?.width && containerRef.current) {
            const containerWidth = containerRef.current.clientWidth - pageMargin - 20
            if (firstPageData.width > containerWidth) {
                setScale(containerWidth / firstPageData.width)
            }
        }
    }, [firstPageData])

    useEffect(() => {
        if (status === STATUS_COMPLETE && initialPageIndex > 0 && pagesRefs[initialPageIndex]) {
            goToPage(initialPageIndex)
        }
    }, [status, goToPage, initialPageIndex, pagesRefs])

    const pageVisibility = Array(doc?.numPages || 0)
        .fill()
        .map(() => 0)

    const onPageVisibilityChange = (changedPageIndex, ratio) => {
        if (status === STATUS_COMPLETE) {
            pageVisibility[changedPageIndex] = ratio
            const maxRatioPage = pageVisibility.reduce((maxIndex, item, index, array) => (item > array[maxIndex] ? index : maxIndex), 0)
            setCurrentPageIndex(maxRatioPage)
            onPageIndexChange(maxRatioPage)
        }
    }

    const [sidePanelOpen, setSidePanelOpen] = useState(false)
    const toggleSidePanel = () => setSidePanelOpen((open) => !open)

    const [sidebarTab, setSidebarTab] = useState('thumbnails')
    const handleSidebarTabSwitch = (tab) => setSidebarTab(tab)

    const [expandedBookmarks, setExpandedBookmarks] = useState([])

    return (
        <>
            <div ref={viewerRef} className={classes.viewer}>
                <Toolbar
                    viewerRef={viewerRef}
                    containerRef={containerRef}
                    pagesRefs={pagesRefs}
                    initialPageIndex={initialPageIndex}
                    numPages={doc?.numPages}
                    firstPageData={firstPageData}
                    pageMargin={pageMargin}
                    scale={scale}
                    setScale={setScale}
                    toggleSidePanel={toggleSidePanel}
                    fullscreenClass={classes.fullscreen}
                    fullscreenExitClass={classes.fullscreenExit}
                />

                <SplitPaneLayout
                    className={classes.container}
                    left={
                        <div className={classes.sidebar}>
                            <SideToolbar viewerRef={viewerRef} currentTab={sidebarTab} onTabSwitch={handleSidebarTabSwitch} />
                            <div ref={sidebarRef} className={classes.sidebarContent}>
                                {sidebarTab === 'thumbnails' && sidePanelOpen && status === STATUS_COMPLETE && (
                                    <ThumbnailsView
                                        containerRef={sidebarRef}
                                        thumbnailsRefs={thumbnailsRefs}
                                        rotation={rotation}
                                        currentPageIndex={currentPageIndex}
                                        onSelect={goToPage}
                                    />
                                )}
                                {sidebarTab === 'bookmarks' && sidePanelOpen && status === STATUS_COMPLETE && (
                                    <BookmarksView expanded={expandedBookmarks} onSetExpanded={setExpandedBookmarks} onSelect={goToPage} />
                                )}
                                {sidebarTab === 'attachments' && sidePanelOpen && status === STATUS_COMPLETE && <AttachmentsView />}
                            </div>
                        </div>
                    }
                    leftSize={sidePanelOpen ? '194px' : '0'}
                    leftMinSize={194}
                    leftStyle={{ visibility: sidePanelOpen ? 'visible' : 'hidden', overflowY: 'hidden' }}
                    leftResizerStyle={{ visibility: sidePanelOpen ? 'visible' : 'hidden', width: sidePanelOpen ? 11 : 10 }}>
                    <div className={cx(classes.container, 'pdfViewer')} ref={containerRef}>
                        {status === STATUS_LOADING && <Loading variant={percent > 0 ? 'determinate' : 'indeterminate'} value={percent} />}
                        {status === STATUS_ERROR && (
                            <div className={classes.error}>
                                <Typography color="error">{error.message}</Typography>
                            </div>
                        )}
                        {status === STATUS_COMPLETE &&
                            Array(doc.numPages)
                                .fill()
                                .map((_, index) => {
                                    return (
                                        <Page
                                            key={index}
                                            ref={pagesRefs[index]}
                                            doc={doc}
                                            containerRef={containerRef}
                                            pagesRefs={pagesRefs}
                                            renderer={renderer}
                                            pageIndex={index}
                                            width={firstPageData.width}
                                            height={firstPageData.height}
                                            rotation={rotation}
                                            scale={scale}
                                            onVisibilityChanged={onPageVisibilityChange}
                                        />
                                    )
                                })}
                    </div>
                </SplitPaneLayout>
            </div>

            {!!Object.entries(externalLinks).length && (
                <Box>
                    <Expandable
                        resizable
                        defaultOpen
                        highlight={false}
                        fullHeight={false}
                        title={
                            <>
                                {cloneElement(reactIcons.link, { className: classes.icon })}
                                External links
                            </>
                        }>
                        <div className={classes.externalLinks}>
                            <div className={classes.externalLinksTitle}>
                                <Typography>
                                    Take care when opening links, they may contain trackers or identifiers of the document they come from
                                </Typography>
                            </div>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Page</TableCell>
                                        <TableCell>URL</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(externalLinks)
                                        .reduce((acc, [, indices]) => [...acc, ...indices], [])
                                        .map(({ pageIndex, url }, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <strong>#{pageIndex + 1}</strong>
                                                    &nbsp;
                                                    <a href="#" onClick={() => goToPage(pageIndex)}>
                                                        Scroll to
                                                    </a>
                                                </TableCell>
                                                <TableCell>
                                                    <pre title={url}>{url}</pre>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>
                    </Expandable>
                </Box>
            )}
        </>
    )
}
