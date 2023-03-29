import { observer } from 'mobx-react-lite'
import { FC, useEffect, useState } from 'react'

import { PDFPageData } from '../../stores/PDFViewerStore'
import { useSharedStore } from '../SharedStoreProvider'

import { AnnotationLayer } from './layers/AnnotationLayer'
import { CanvasLayer } from './layers/CanvasLayer'
import { SVGLayer } from './layers/SVGLayer'
import { TextLayer } from './layers/TextLayer'

interface PageProps {
    renderer: 'canvas' | 'svg'
    index: number
}

export const Page: FC<PageProps> = observer(({ renderer, index }) => {
    const { containerRef, pagesRefs, setPageRef, doc, firstPageProps, rotation, scale, handlePageVisibilityChange } = useSharedStore().pdfViewerStore

    if (!doc || !firstPageProps) {
        return null
    }

    const { width, height } = firstPageProps

    const [pageData, setPageData] = useState<PDFPageData>({
        page: undefined,
        width,
        height,
        rotation,
    })

    const [visible, setVisible] = useState(false)

    const getPageData = () => {
        doc.getPage(index + 1).then((page) => {
            const { width, height, rotation } = page.getViewport({ scale: 1 })

            setPageData({
                page,
                width,
                height,
                rotation,
            })
        })
    }

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (pageData.page === null) {
                            getPageData()
                        }
                    }
                    setVisible(entry.isIntersecting)
                    handlePageVisibilityChange(index, entry.isIntersecting ? entry.intersectionRatio : -1)
                })
            },
            {
                threshold: Array(10)
                    .fill(0)
                    .map((_, i) => i / 10),
            }
        )
        const ref = pagesRefs[index]
        observer.observe(ref)

        return () => {
            observer.unobserve(ref)
        }
    })

    const { page, width: pageWidth, height: pageHeight } = pageData

    const scaledWidth = (pageWidth || width) * scale
    const scaledHeight = (pageHeight || height) * scale

    const isVertical = Math.abs(rotation) % 180 === 0
    const elementWidth = isVertical ? scaledWidth : scaledHeight
    const elementHeight = isVertical ? scaledHeight : scaledWidth

    const normalizedRotation = (rotation + pageData.rotation) % 360

    return (
        <div
            ref={setPageRef(index)}
            className="page"
            style={{
                width: elementWidth,
                height: elementHeight,
            }}>
            {!page || !visible || !containerRef ? (
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
                        pageIndex={index}
                        containerRef={containerRef}
                        pagesRefs={pagesRefs}
                        rotation={normalizedRotation}
                        scale={scale}
                    />
                </>
            )}
        </div>
    )
})
