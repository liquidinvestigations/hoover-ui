import { SVGGraphics } from 'pdfjs-dist/build/pdf'
import { useEffect, useRef } from 'react'

export default function SVGLayer({ page, width, height, rotation, scale }) {
    const containerRef = useRef()

    const clear = () => {
        const container = containerRef.current
        if (!container) {
            return
        }
        while (container.firstChild) {
            container.firstChild.remove()
        }
    }

    useEffect(() => {
        const container = containerRef.current
        const viewport = page.getViewport({ rotation, scale })

        page.getOperatorList().then((operatorList) => {
            clear()
            const graphic = new SVGGraphics(page.commonObjs, page.objs)
            graphic.getSVG(operatorList, viewport).then((svg) => {
                svg.style.height = height
                svg.style.width = width

                container.appendChild(svg)
            })
        })
    }, [rotation, scale])

    return <div ref={containerRef} className="svgLayer" />
}
