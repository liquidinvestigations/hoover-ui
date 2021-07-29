import React, { createRef, useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { Paper, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import Loading from '../../Loading'
import Page from './Page'
import Toolbar from './Toolbar'
import { STATUS_COMPLETE, STATUS_ERROR, STATUS_LOADING, useDocument } from './DocumentProvider'

const useStyles = makeStyles(theme => ({
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
            }
        }
    },
    externalLinks: {
        margin: theme.spacing(1),
        overflow: 'auto',
        '& th': {
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
        },
        '& td': {
            whiteSpace: 'nowrap',
        },
        '& pre': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
        }
    },
    externalLinksTitle: {
        padding: theme.spacing(2),
    },
}))

const pageMargin = 20

export default function Document({ initialPageIndex, onPageIndexChange, renderer = 'canvas' }) {
    const classes = useStyles()
    const { doc, firstPageData, status, error, percent, externalLinks } = useDocument()
    const [rotation, setRotation] = useState(0)
    const [scale, setScale] = useState(1)
    const [pagesRefs, setPagesRefs] = useState([])

    const viewerRef = useRef()
    const containerRef = useRef()

    const goToPage = index => {
        containerRef.current.scrollTop = pagesRefs[index].current.offsetTop
    }

    useEffect(() => {
        if (doc?.numPages) {
            setPagesRefs(pagesRefs =>
                Array(doc.numPages).fill().map((_, i) => pagesRefs[i] || createRef())
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
    }, [status])

    const pageVisibility = Array(doc?.numPages || 0).fill().map(() => 0)

    const onPageVisibilityChange = (changedPageIndex, ratio) => {
        if (status === STATUS_COMPLETE) {
            pageVisibility[changedPageIndex] = ratio
            const maxRatioPage = pageVisibility.reduce(
                (maxIndex, item, index, array) =>
                    item > array[maxIndex] ? index : maxIndex, 0
            )
            onPageIndexChange(maxRatioPage)
        }
    }

    return (
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
                fullscreenClass={classes.fullscreen}
                fullscreenExitClass={classes.fullscreenExit}
            />

            <div className={cn(classes.container, 'pdfViewer')} ref={containerRef}>
                {status === STATUS_LOADING && (
                    <Loading
                        variant={percent > 0 ? 'determinate' : 'indeterminate'}
                        value={percent}
                    />
                )}
                {status === STATUS_ERROR && (
                    <div className={classes.error}>
                        <Typography color="error">{error.message}</Typography>
                    </div>
                )}
                {status === STATUS_COMPLETE &&
                    Array(doc.numPages).fill().map((_, index) => {
                       return  (
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
                    })
                }
            </div>

            {!!externalLinks?.length && (
                <Paper className={classes.externalLinks}>
                    <div className={classes.externalLinksTitle}>
                        <Typography variant="h5">
                            External Links
                        </Typography>
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
                            {externalLinks.map(({ pageIndex, url}) => (
                                <TableRow>
                                    <TableCell>
                                        <strong>#{pageIndex + 1}</strong>
                                        &nbsp;
                                        <a href="#" onClick={() => goToPage(pageIndex)}>Scroll to</a>
                                    </TableCell>
                                    <TableCell>
                                        <pre title={url}>{url}</pre>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Paper>
            )}
        </div>
    )
}
