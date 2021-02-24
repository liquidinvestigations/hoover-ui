import React, { useEffect, useRef, useState } from 'react'
import Loading from '../../Loading'
import CanvasLayer from './layers/CanvasLayer'
import SVGLayer from './layers/SVGLayer'
import TextLayer from './layers/TextLayer'
import AnnotationLayer from './layers/AnnotationLayer'

export default function Page({ doc, pageIndex, width, height, rotation, scale }) {
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

    const pageRef = useRef()

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        getPageData()
                    }
                })
            }
        )
        if (pageRef.current) {
            observer.observe(pageRef.current)
        }

        return () => {
            if (pageRef.current) {
                observer.unobserve(pageRef.current)
            }
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
                    <CanvasLayer
                        page={page}
                        width={elementWidth}
                        height={elementHeight}
                        rotation={normalizedRotation}
                        scale={scale}
                    />
                    <SVGLayer
                        page={page}
                        width={elementWidth}
                        height={elementHeight}
                        rotation={normalizedRotation}
                        scale={scale}
                    />
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
}
