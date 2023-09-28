import { observer } from 'mobx-react-lite'
import { forwardRef, useCallback, useEffect, useState } from 'react'

import { useSharedStore } from '../SharedStoreProvider'

import AnnotationLayer from './layers/AnnotationLayer'
import CanvasLayer from './layers/CanvasLayer'
import SVGLayer from './layers/SVGLayer'
import TextLayer from './layers/TextLayer'

// eslint-disable-next-line react/display-name
export const Page = observer(
    forwardRef(({ doc, containerRef, pagesRefs, renderer, pageIndex, width, height, rotation, scale, onVisibilityChanged }, pageRef) => {
        const [pageData, setPageData] = useState({
            page: null,
            width,
            height,
            rotation,
        })
        const [visible, setVisible] = useState(false)
        const {
            documentStore: {
                documentSearchStore: {
                    pdfSearchStore: { currentHighlightIndex, searchResults },
                },
            },
        } = useSharedStore()

        const getPageData = useCallback(() => {
            doc.getPage(pageIndex + 1).then((page) => {
                const { width, height, rotation } = page.getViewport({ scale: 1 })

                setPageData({
                    page,
                    width,
                    height,
                    rotation,
                })
            })
        }, [doc, pageIndex])

        useEffect(() => {
            if (!pageRef) return
            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            if (pageData.page === null) {
                                getPageData()
                            }
                        }
                        setVisible(entry.isIntersecting)
                        onVisibilityChanged(pageIndex, entry.isIntersecting ? entry.intersectionRatio : -1)
                    })
                },
                {
                    threshold: Array(10)
                        .fill()
                        .map((_, i) => i / 10),
                },
            )
            const ref = pageRef.current
            observer.observe(ref)

            return () => {
                observer.unobserve(ref)
            }
        }, [getPageData, onVisibilityChanged, pageData.page, pageIndex, pageRef])

        const { page, width: pageWidth, height: pageHeight } = pageData

        const scaledWidth = pageWidth * scale
        const scaledHeight = pageHeight * scale

        const isVertical = Math.abs(rotation) % 180 === 0
        const elementWidth = isVertical ? scaledWidth : scaledHeight
        const elementHeight = isVertical ? scaledHeight : scaledWidth

        const normalizedRotation = (rotation + pageData.rotation) % 360

        return (
            <div
                ref={pageRef}
                className="page"
                style={{
                    width: elementWidth,
                    height: elementHeight,
                }}
            >
                {!page || (!visible && !searchResults[currentHighlightIndex]?.pageNum - 1 === pageIndex) ? (
                    <span className="loadingIcon" />
                ) : (
                    <>
                        {renderer === 'canvas' && (
                            <CanvasLayer page={page} width={elementWidth} height={elementHeight} rotation={normalizedRotation} scale={scale} />
                        )}
                        {renderer === 'svg' && (
                            <SVGLayer page={page} width={elementWidth} height={elementHeight} rotation={normalizedRotation} scale={scale} />
                        )}
                        <TextLayer page={page} rotation={normalizedRotation} scale={scale} />
                        <AnnotationLayer
                            page={page}
                            pageIndex={pageIndex}
                            containerRef={containerRef}
                            pagesRefs={pagesRefs}
                            rotation={normalizedRotation}
                            scale={scale}
                        />
                    </>
                )}
            </div>
        )
    }),
)
