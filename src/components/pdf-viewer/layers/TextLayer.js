import { renderTextLayer } from 'pdfjs-dist/build/pdf'
import { useEffect, useRef } from 'react'

export default function TextLayer({ page, rotation, scale }) {
    const containerRef = useRef()
    const renderTask = useRef()

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
