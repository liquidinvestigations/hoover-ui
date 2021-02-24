import React, { useEffect, useRef } from 'react'

export default function CanvasLayer({ page, width, height, rotation, scale }) {
    const canvasRef = useRef()
    const renderTask = useRef()

    const devicePixelRatio = window.devicePixelRatio || 1

    const cancelTask = () => {
        if (renderTask.current) {
            renderTask.current.cancel()
        }
    }

    useEffect(() => {
        cancelTask()

        const canvasEl = canvasRef.current
        canvasEl.height = height * devicePixelRatio
        canvasEl.width = width * devicePixelRatio
        canvasEl.style.opacity = '0'

        const canvasContext = canvasEl.getContext('2d', { alpha: false })
        const viewport = page.getViewport({ rotation, scale: scale * devicePixelRatio })

        renderTask.current = page.render({ canvasContext, viewport })
        renderTask.current.promise.then(
            () => {
                canvasEl.style.removeProperty('opacity')
            },
            () => {}
        )

        return cancelTask
    }, [rotation, scale])

    return (
        <div
            className="canvasWrapper"
            style={{ width, height }}
        >
            <canvas
                ref={canvasRef}
                style={{
                    transform: `scale(${1 / devicePixelRatio})`,
                    transformOrigin: 'top left',
                }}
            />
        </div>
    )
}
