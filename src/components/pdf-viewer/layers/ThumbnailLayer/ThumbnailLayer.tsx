import { PDFPageProxy, RenderTask } from 'pdfjs-dist'
import { FC, useEffect, useRef, useState } from 'react'

import { useStyles } from './ThumbnailLayer.styles'

interface ThumbnailLayerProps {
    page: PDFPageProxy
    pageWidth: number
    pageHeight: number
    rotation: number
    thumbnailWidth: number
    thumbnailHeight: number
}

export const ThumbnailLayer: FC<ThumbnailLayerProps> = ({ page, pageWidth, pageHeight, rotation, thumbnailWidth, thumbnailHeight }) => {
    const { classes } = useStyles()
    const renderTask = useRef<RenderTask>()
    const [src, setSrc] = useState('')

    const cancelTask = () => {
        if (renderTask.current) {
            renderTask.current.cancel()
        }
    }

    useEffect(() => {
        cancelTask()

        const canvas = document.createElement('canvas')
        const canvasContext = canvas.getContext('2d', { alpha: false })

        if (!canvasContext) {
            return
        }

        const w = thumbnailWidth
        const h = w / (pageWidth / pageHeight)
        const scale = w / pageWidth

        canvas.height = h
        canvas.width = w
        canvas.style.height = `${h}px`
        canvas.style.width = `${w}px`

        const viewport = page.getViewport({ rotation, scale })
        renderTask.current = page.render({ canvasContext, viewport })
        renderTask.current.promise.then(
            () => setSrc(canvas.toDataURL()),
            () => {}
        )

        return cancelTask
    }, [rotation])

    return src ? (
        <img src={src} className={classes.thumbnailImage} width={`${thumbnailWidth}px`} height={`${thumbnailHeight}px`} />
    ) : (
        <div className={classes.thumbnailImage} style={{ width: thumbnailWidth, height: thumbnailHeight }}>
            <span className="loadingIcon" />
        </div>
    )
}
