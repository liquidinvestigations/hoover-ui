import React, { useEffect, useRef } from 'react'
import { AnnotationLayer as PDFJSAnnotationLayer } from 'pdfjs-dist/build/pdf'

export default function AnnotationLayer({ page, rotation, scale }) {
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

        page.getAnnotations().then(annotations => {
            clear()
            PDFJSAnnotationLayer.render({
                annotations,
                div: container,
                imageResourcesPath: '/_next/static/media/annotation/',
                linkService: {
                    externalLinkTarget: 2,
                    externalLinkRel: 'nofollow',
                    externalLinkEnabled: false,
                },
                page,
                renderInteractiveForms: false,
                viewport: viewport.clone({ dontFlip: true }),
            })
        })
    }, [rotation, scale])

    return (
        <div ref={containerRef} className="annotationLayer" />
    )
}
