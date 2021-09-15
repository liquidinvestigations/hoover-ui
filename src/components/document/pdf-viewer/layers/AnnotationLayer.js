import React, { useEffect, useRef, useState } from 'react'
import { AnnotationLayer as PDFJSAnnotationLayer } from 'pdfjs-dist/build/pdf'
import { AnnotationType } from 'pdfjs-dist/lib/shared/util'
import { useDocument } from '../DocumentProvider'

export default function AnnotationLayer({ page, pageIndex, containerRef, pagesRefs, rotation, scale }) {
    const annotationLayerRef = useRef()
    const { doc, setExternalLinks } = useDocument()
    const [cachedPageIndices, setCachedPageIndices] = useState([])

    const clear = () => {
        const container = annotationLayerRef.current
        if (!container) {
            return
        }
        while (container.firstChild) {
            container.firstChild.remove()
        }
    }

    const goToDestinationHelper = (rawDest, namedDest = null, explicitDest) => {
        // Dest array looks like that: <page-ref> </XYZ|/FitXXX> <args..>
        const destRef = explicitDest[0]
        let linkPageIndex

        if (typeof destRef === 'object' && destRef !== null) {
            linkPageIndex = cachedPageIndices[destRef]

            if (linkPageIndex === undefined) {
                // Fetch the page reference if it's not yet available. This could
                // only occur during loading, before all pages have been resolved.
                doc
                    .getPageIndex(destRef)
                    .then(index => {
                        setCachedPageIndices(numbers => {
                            numbers[destRef] = index
                            return numbers
                        })
                        goToDestinationHelper(rawDest, namedDest, explicitDest)
                    })
                    .catch(() => {
                        console.error(
                            `goToDestinationHelper: "${destRef}" is not ` +
                            `a valid page reference, for dest="${rawDest}".`
                        )
                    })
                return
            }
        } else if (Number.isInteger(destRef)) {
            linkPageIndex = destRef
        } else {
            console.error(
                `goToDestinationHelper: "${destRef}" is not ` +
                `a valid destination reference, for dest="${rawDest}".`
            )
            return;
        }
        if (linkPageIndex === null || linkPageIndex < 0 || linkPageIndex > doc.numPages - 1) {
            console.error(
                `goToDestinationHelper: "${linkPageIndex}" is not ` +
                `a valid page index, for dest="${rawDest}".`
            )
            return
        }

        containerRef.current.scrollTop = pagesRefs[linkPageIndex].current.offsetTop
    }

    useEffect(() => {
        const container = annotationLayerRef.current
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
                    getDestinationHash: dest => {
                        if (typeof dest === 'string') {
                            if (dest.length > 0) {
                                return '#' + escape(dest)
                            }
                        } else if (Array.isArray(dest)) {
                            const str = JSON.stringify(dest)
                            if (str.length > 0) {
                                return '#' + escape(str)
                            }
                        }
                        return ''
                    },
                    goToDestination: async dest => {
                        if (!doc) {
                            return
                        }
                        let namedDest, explicitDest
                        if (typeof dest === 'string') {
                            namedDest = dest
                            explicitDest = await doc.getDestination(dest)
                        } else {
                            namedDest = null
                            explicitDest = await dest
                        }
                        if (!Array.isArray(explicitDest)) {
                            console.error(
                                `PDFLinkService.goToDestination: "${explicitDest}" is not ` +
                                `a valid destination array, for dest="${dest}".`
                            );
                            return
                        }
                        goToDestinationHelper(dest, namedDest, explicitDest)
                    },
                },
                page,
                renderInteractiveForms: false,
                viewport: viewport.clone({ dontFlip: true }),
            })
            setExternalLinks(prevLinks => {
                    const newLinks = annotations
                        .filter(annotation => annotation.annotationType === AnnotationType.LINK && annotation.url)
                        .map(({url}) => ({ pageIndex, url }))

                    if (newLinks.length && !prevLinks[newLinks[0].pageIndex]) {
                        prevLinks = {...prevLinks, [newLinks[0].pageIndex]: newLinks}
                    }

                    return prevLinks
                }
            )
        })
    }, [rotation, scale])

    return (
        <div ref={annotationLayerRef} className="annotationLayer" />
    )
}
