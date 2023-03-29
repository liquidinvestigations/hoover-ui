import { Box, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import cx from 'classnames'
import { observer } from 'mobx-react-lite'
import { cloneElement, FC } from 'react'

import { reactIcons } from '../../constants/icons'
import { PDFExternalLink, PDFStatus } from '../../stores/PDFViewerStore'
import { Expandable } from '../common/Expandable/Expandable'
import { SplitPaneLayout } from '../common/SplitPaneLayout/SplitPaneLayout'
import Loading from '../Loading'
import { useSharedStore } from '../SharedStoreProvider'

import { AttachmentsView } from './AttachmentsView/AttachmentsView'
import { BookmarksView } from './BookmarksView/BookmarksView'
import { Page } from './Page'
import { useStyles } from './PDFViever.styles'
import { SideToolbar } from './SideToolbar/SideToolbar'
import { ThumbnailsView } from './ThumbnailsView/ThumbnailsView'
import { Toolbar } from './Toolbar/Toolbar'

export const PDFViewer: FC<{ url: string }> = observer(({ url }) => {
    const { classes } = useStyles()
    const {
        setViewerRef,
        setContainerRef,
        setSidebarRef,
        sidebarTab,
        sidebarOpen,
        loadDocument,
        doc,
        goToPage,
        status,
        error,
        percent,
        externalLinks,
    } = useSharedStore().pdfViewerStore

    loadDocument(url)

    return (
        <>
            <div ref={setViewerRef} className={classes.viewer}>
                <Toolbar fullscreenClass={classes.fullscreen} fullscreenExitClass={classes.fullscreenExit} />

                <SplitPaneLayout
                    className={classes.container}
                    left={
                        <div className={classes.sidebar}>
                            <SideToolbar />
                            <div ref={setSidebarRef} className={classes.sidebarContent}>
                                {sidebarTab === 'thumbnails' && sidebarOpen && status === PDFStatus.COMPLETE && <ThumbnailsView />}
                                {sidebarTab === 'bookmarks' && sidebarOpen && status === PDFStatus.COMPLETE && <BookmarksView />}
                                {sidebarTab === 'attachments' && sidebarOpen && status === PDFStatus.COMPLETE && <AttachmentsView />}
                            </div>
                        </div>
                    }
                    leftSize={sidebarOpen ? '194px' : '0'}
                    leftMinSize={194}
                    leftStyle={{ visibility: sidebarOpen ? 'visible' : 'hidden', overflowY: 'hidden' }}
                    leftResizerStyle={{ visibility: sidebarOpen ? 'visible' : 'hidden', width: sidebarOpen ? 11 : 10 }}>
                    <div className={cx(classes.container, 'pdfViewer')} ref={setContainerRef}>
                        {status === PDFStatus.LOADING && <Loading variant={percent > 0 ? 'determinate' : 'indeterminate'} value={percent} />}
                        {status === PDFStatus.ERROR && (
                            <div className={classes.error}>
                                <Typography color="error">{error.message}</Typography>
                            </div>
                        )}
                        {status === PDFStatus.COMPLETE &&
                            Array(doc?.numPages)
                                .fill(0)
                                .map((_, index) => {
                                    return <Page key={index} renderer="canvas" index={index} />
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
                                        .reduce((acc, [, indices]) => [...acc, ...indices], [] as PDFExternalLink[])
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
})

export default PDFViewer
