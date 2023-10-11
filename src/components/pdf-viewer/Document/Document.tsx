import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { T } from '@tolgee/react'
import { observer } from 'mobx-react-lite'
import { cloneElement, createRef, FC, RefObject, useCallback, useEffect, useRef, useState } from 'react'

import { reactIcons } from '../../../constants/icons'
import { Expandable } from '../../common/Expandable/Expandable'
import { Loading } from '../../common/Loading/Loading'
import { SplitPaneLayout } from '../../common/SplitPaneLayout/SplitPaneLayout'
import { useSharedStore } from '../../SharedStoreProvider'
import { ExternalLink, STATUS_COMPLETE, STATUS_ERROR, STATUS_LOADING, useDocument } from '../DocumentProvider'
import { Page } from '../Page'
import { SideToolbar } from '../SideToolbar'
import { Toolbar } from '../Toolbar/Toolbar'
import { AttachmentsView } from '../views/AttachmentsView'
import { BookmarksView } from '../views/BookmarksView'
import { ThumbnailsView } from '../views/ThumbnailsView'

import { useStyles } from './Document.styles'

const pageMargin = 20

interface DocumentProps {
    initialPageIndex: number
    onPageIndexChange: (index: number) => void
    renderer?: string
}

export const Document: FC<DocumentProps> = observer(({ initialPageIndex, onPageIndexChange, renderer = 'canvas' }) => {
    const { classes, cx } = useStyles()
    const doc = useDocument()?.doc
    const firstPageData = useDocument()?.firstPageData
    const status = useDocument()?.status
    const error = useDocument()?.error
    const percent = useDocument()?.percent
    const externalLinks = useDocument()?.externalLinks
    const [rotation] = useState(0)
    const [scale, setScale] = useState(1)
    const [currentPageIndex, setCurrentPageIndex] = useState(initialPageIndex)
    const [pagesRefs, setPagesRefs] = useState<RefObject<HTMLDivElement>[]>([])
    const [thumbnailsRefs, setThumbnailsRefs] = useState<RefObject<HTMLDivElement>[]>([])
    const {
        documentStore: {
            subTab,
            pdfDocumentInfo,
            chunkTab,
            documentSearchStore: {
                pdfSearchStore: { searchResults, currentHighlightIndex },
            },
        },
    } = useSharedStore()

    const viewerRef = useRef<HTMLDivElement>(null)
    const containerRef = useRef<HTMLDivElement>(null)
    const sidebarRef = useRef<HTMLDivElement>(null)

    const goToPage = useCallback(
        (index: number) => {
            setCurrentPageIndex(index)
            if (pagesRefs[index]) {
                if (containerRef.current) {
                    containerRef.current.scrollTop = pagesRefs[index].current?.offsetTop || 0
                }
            }
        },
        [containerRef, pagesRefs],
    )

    useEffect(() => {
        if (doc?.numPages) {
            setPagesRefs((refs) =>
                Array(doc.numPages)
                    .fill(0)
                    .map((_, i) => refs[i] || createRef()),
            )
            setThumbnailsRefs((refs) =>
                Array(doc.numPages)
                    .fill(0)
                    .map((_, i) => refs[i] || createRef()),
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
        if (status === STATUS_COMPLETE && initialPageIndex > 0 && pagesRefs[initialPageIndex] && scale !== 1) {
            goToPage(initialPageIndex)
        }
    }, [status, goToPage, initialPageIndex, pagesRefs, scale])

    useEffect(() => {
        const { chunks } = pdfDocumentInfo
        if (!pagesRefs?.length) return

        const activeSearchResults = searchResults[subTab]?.[chunks[chunkTab]]
        if (!activeSearchResults?.length) return

        const highlightPage = activeSearchResults[currentHighlightIndex]?.pageNum - 1
        if (highlightPage !== currentPageIndex) goToPage(highlightPage)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentHighlightIndex])

    const pageVisibility = Array(doc?.numPages || 0)
        .fill(0)
        .map(() => 0)

    const onPageVisibilityChange = (changedPageIndex: number, ratio: number) => {
        if (status === STATUS_COMPLETE) {
            pageVisibility[changedPageIndex] = ratio
            const maxRatioPage = pageVisibility.reduce((maxIndex, item, index, array) => (item > array[maxIndex] ? index : maxIndex), 0)
            setCurrentPageIndex(maxRatioPage)
            onPageIndexChange(maxRatioPage)
        }
    }

    const [sidePanelOpen, setSidePanelOpen] = useState(false)
    const toggleSidePanel = () => setSidePanelOpen((open) => !open)

    const [sidebarTab, setSidebarTab] = useState<string>('thumbnails')
    const handleSidebarTabSwitch = (tab: string) => setSidebarTab(tab)

    const [expandedBookmarks, setExpandedBookmarks] = useState<string[]>([])

    return (
        <>
            <div ref={viewerRef} className={classes.viewer}>
                <Toolbar
                    viewerRef={viewerRef}
                    containerRef={containerRef}
                    pagesRefs={pagesRefs}
                    currentPageIndex={currentPageIndex}
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
                            <SideToolbar viewerRef={viewerRef} onTabSwitch={handleSidebarTabSwitch} />
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
                        {status === STATUS_LOADING && <Loading variant={percent && percent > 0 ? 'determinate' : 'indeterminate'} value={percent} />}
                        {status === STATUS_ERROR && error?.message && (
                            <div className={classes.error}>
                                <Typography color="error">{error.message}</Typography>
                            </div>
                        )}
                        {status === STATUS_COMPLETE &&
                            Array(doc?.numPages)
                                .fill(0)
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
                                            width={firstPageData?.width || 0}
                                            height={firstPageData?.height || 0}
                                            rotation={rotation}
                                            scale={scale}
                                            onVisibilityChanged={onPageVisibilityChange}
                                        />
                                    )
                                })}
                    </div>
                </SplitPaneLayout>
            </div>

            {externalLinks && !!Object.entries(externalLinks).length && (
                <Box>
                    <Expandable
                        resizable
                        defaultOpen
                        highlight={false}
                        fullHeight={false}
                        title={
                            <>
                                {cloneElement(reactIcons.link, { className: classes.icon })}
                                <T keyName="external_links">External links</T>
                            </>
                        }>
                        <div className={classes.externalLinks}>
                            <div className={classes.externalLinksTitle}>
                                <Typography>
                                    <T keyName="pdf_links_warn">
                                        Take care when opening links, they may contain trackers or identifiers of the document they come from
                                    </T>
                                </Typography>
                            </div>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>
                                            <T keyName="page">Page</T>
                                        </TableCell>
                                        <TableCell>
                                            <T keyName="url">URL</T>
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {Object.entries(externalLinks)
                                        .reduce((acc, [, indices]) => [...acc, ...indices], [] as ExternalLink[])
                                        .map(({ pageIndex, url }, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    <strong>#{pageIndex + 1}</strong>
                                                    &nbsp;
                                                    <a href="#" onClick={() => goToPage(pageIndex)}>
                                                        <T keyName="scroll_to">Scroll to</T>
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
})
