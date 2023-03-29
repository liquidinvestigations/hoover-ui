import { PDFPageProxy, TextLayerRenderTask, renderTextLayer } from 'pdfjs-dist'
import { FC, RefObject, useEffect, useRef } from 'react'

interface TextLayerProps {
    page: PDFPageProxy
    rotation: number
    scale: number
}

export const TextLayer: FC<TextLayerProps> = ({ page, rotation, scale }) => {
    const containerRef: RefObject<HTMLDivElement> = useRef(null)
    const renderTask = useRef<TextLayerRenderTask>()

    const clear = () => {
        const container = containerRef.current
        if (!container) {
            return
        }
        while (container.firstChild) {
            container.firstChild.remove()
        }
    }

    const cancelTask = () => {
        if (renderTask.current) {
            renderTask.current.cancel()
        }
    }

    useEffect(() => {
        cancelTask()

        const container = containerRef.current

        if (!container) {
            return
        }

        const viewport = page.getViewport({ rotation, scale })

        page.getTextContent().then((textContent) => {
            clear()
            renderTask.current = renderTextLayer({
                container,
                textContent,
                viewport,
            })
            renderTask.current.promise.then(
                () => {
                    // TODO select elasticsearch found phrases
                },
                () => {}
            )
        })

        return cancelTask
    }, [rotation, scale])

    return <div ref={containerRef} className="textLayer" />
}
