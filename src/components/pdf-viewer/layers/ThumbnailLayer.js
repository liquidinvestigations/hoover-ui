import { makeStyles } from '@mui/styles'
import { useEffect, useRef, useState } from 'react'

const useStyles = makeStyles((theme) => ({
    thumbnailImage: {
        opacity: 0.8,
        border: '1px solid rgba(0, 0, 0, 0)',
        boxShadow: '0 0 0 1px rgb(0 0 0 / 50%), 0 2px 8px rgb(0 0 0 / 30%)',
        backgroundColor: '#fff',
        backgroundClip: 'content-box',
        boxSizing: 'border-box',
    },
}))

export default function ThumbnailLayer({ page, pageWidth, pageHeight, rotation, thumbnailWidth, thumbnailHeight }) {
    const classes = useStyles()
    const renderTask = useRef()
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
