import React, { forwardRef, useEffect, useState } from 'react'
import Loading from '../../Loading'
import CanvasLayer from './layers/CanvasLayer'
import SVGLayer from './layers/SVGLayer'
import TextLayer from './layers/TextLayer'
import AnnotationLayer from './layers/AnnotationLayer'

export default forwardRef(({ doc, renderer, pageIndex, width, height, rotation, scale, onVisibilityChanged }, pageRef) => {
    const [pageData, setPageData] = useState({
        page: null,
        width, height, rotation
    })

    const getPageData = () => {
        doc.getPage(pageIndex + 1).then(page => {
            const { width, height, rotation } = page.getViewport({ scale: 1 })

            setPageData({
                page, width, height, rotation
            })
        })
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        if (pageData.page === null) {
                            getPageData()
                        }
                    }
                    onVisibilityChanged(pageIndex, entry.isIntersecting ? entry.intersectionRatio : -1)
                })
            },
            {
                threshold: Array(10).fill().map((_, i) => i / 10)
            }
        )
        const ref = pageRef.current
        observer.observe(ref)

        return () => {
            observer.unobserve(ref)
        }
    }, [])

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
            {!page ? <Loading /> :
                <>
                    {renderer === 'canvas' && (
                        <CanvasLayer
                            page={page}
                            width={elementWidth}
                            height={elementHeight}
                            rotation={normalizedRotation}
                            scale={scale}
                        />
                    )}
                    {renderer === 'svg' && (
                        <SVGLayer
                            page={page}
                            width={elementWidth}
                            height={elementHeight}
                            rotation={normalizedRotation}
                            scale={scale}
                        />
                    )}
                    <TextLayer
                        page={page}
                        rotation={normalizedRotation}
                        scale={scale}
                    />
                    <AnnotationLayer
                        page={page}
                        rotation={normalizedRotation}
                        scale={scale}
                    />
                </>
            }
        </div>
    )
})
