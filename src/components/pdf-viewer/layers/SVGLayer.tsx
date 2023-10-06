import { PDFPageProxy } from 'pdfjs-dist'
import { SVGGraphics } from 'pdfjs-dist/build/pdf'
import { FC, useEffect, useRef } from 'react'

interface SVGLayerProps {
    page: PDFPageProxy
    width: number
    height: number
    rotation: number
    scale: number
}

export const SVGLayer: FC<SVGLayerProps> = ({ page, width, height, rotation, scale }) => {
    const containerRef = useRef<HTMLDivElement>(null)

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
            graphic.getSVG(operatorList, viewport).then((svg: SVGElement) => {
                svg.style.height = height.toString()
                svg.style.width = width.toString()

                container?.appendChild(svg)
            })
        })
    }, [height, page, rotation, scale, width])

    return <div ref={containerRef} className="svgLayer" />
}
