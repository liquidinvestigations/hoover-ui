import { PDFPageProxy } from 'pdfjs-dist'
import { RenderTask } from 'pdfjs-dist/types/src/display/api'
import { FC, RefObject, useEffect, useRef, useState } from 'react'

interface CanvasLayerProps {
    page: PDFPageProxy
    width: number
    height: number
    rotation: number
    scale: number
}

export const CanvasLayer: FC<CanvasLayerProps> = ({ page, width, height, rotation, scale }) => {
    const canvasRef: RefObject<HTMLCanvasElement> = useRef(null)
    const renderTask = useRef<RenderTask>()
    const [prevScale, setPrevScale] = useState(scale)

    const devicePixelRatio = window.devicePixelRatio || 1

    const cancelTask = () => {
        if (renderTask.current) {
            renderTask.current.cancel()
        }
    }

    useEffect(() => {
        cancelTask()
        setPrevScale(scale)

        const canvasEl = canvasRef.current

        if (!canvasEl) {
            return
        }

        canvasEl.height = height * devicePixelRatio
        canvasEl.width = width * devicePixelRatio
        canvasEl.style.opacity = '0'

        const canvasContext = canvasEl.getContext('2d', { alpha: false })

        if (!canvasContext) {
            return
        }

        const viewport = page.getViewport({ rotation, scale: scale * devicePixelRatio })

        renderTask.current = page.render({ canvasContext, viewport })
        renderTask.current.promise.then(
            () => {
                canvasEl.style.removeProperty('opacity')
                canvasEl.style.transform = `scale(${1 / devicePixelRatio})`
            },
            () => {}
        )

        return cancelTask
    }, [rotation, scale])

    return (
        <div className="canvasWrapper" style={{ width, height }}>
            <canvas
                ref={canvasRef}
                style={{
                    transform: `scale(${scale / prevScale})`,
                    transformOrigin: 'top left',
                }}
            />
        </div>
    )
}
