import React, { createRef, useEffect, useRef, useState } from 'react'
import cn from 'classnames'
import { Typography } from '@material-ui/core'
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
}))

const pageMargin = 20

export default function Document({ initialPageIndex, onPageIndexChange, renderer = 'canvas' }) {
    const classes = useStyles()
    const { doc, firstPageData, status, error, percent } = useDocument()
    const [rotation, setRotation] = useState(0)
    const [scale, setScale] = useState(1)
    const [pagesRefs, setPagesRefs] = useState([])

    const viewerRef = useRef()
    const containerRef = useRef()

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
            containerRef.current.scrollTop = pagesRefs[initialPageIndex].current.offsetTop
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
        </div>
    )
}
