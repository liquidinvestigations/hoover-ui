import { PDFPageProxy, SVGGraphics } from 'pdfjs-dist'
import { FC, RefObject, useEffect, useRef } from 'react'

interface SVGLayerProps {
    page: PDFPageProxy
    width: number
    height: number
    rotation: number
    scale: number
}

export const SVGLayer: FC<SVGLayerProps> = ({ page, width, height, rotation, scale }) => {
    const containerRef: RefObject<HTMLDivElement> = useRef(null)

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

        if (!container) {
            return
        }

        const viewport = page.getViewport({ rotation, scale })

        page.getOperatorList().then((operatorList) => {
            clear()
            const graphic = new SVGGraphics(page.commonObjs, page.objs)
            graphic.getSVG(operatorList, viewport).then((svg: SVGElement) => {
                svg.style.width = `${width}px`
                svg.style.height = `${height}px`

                container.appendChild(svg)
            })
        })
    }, [rotation, scale])

    return <div ref={containerRef} className="svgLayer" />
}
