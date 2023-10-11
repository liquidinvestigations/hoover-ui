import Image from 'next/image'
import { PDFPageProxy } from 'pdfjs-dist'
import { RenderTask } from 'pdfjs-dist/types/src/display/api'
import { FC, useEffect, useRef, useState } from 'react'
import { makeStyles } from 'tss-react/mui'

const useStyles = makeStyles()(() => ({
    thumbnailImage: {
        opacity: 0.8,
        border: '1px solid rgba(0, 0, 0, 0)',
        boxShadow: '0 0 0 1px rgb(0 0 0 / 50%), 0 2px 8px rgb(0 0 0 / 30%)',
        backgroundColor: '#fff',
        backgroundClip: 'content-box',
        boxSizing: 'border-box',
    },
}))

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
            () => {},
        )

        return cancelTask
    }, [page, pageHeight, pageWidth, rotation, thumbnailWidth])

    return src ? (
        <Image alt="Thumbnail image" src={src} className={classes.thumbnailImage} width={thumbnailWidth} height={thumbnailHeight} />
    ) : (
        <div className={classes.thumbnailImage} style={{ width: thumbnailWidth, height: thumbnailHeight }}>
            <span className="loadingIcon" />
        </div>
    )
}
