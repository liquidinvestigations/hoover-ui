import { PDFPageProxy } from 'pdfjs-dist'
import { AnnotationLayer as PDFJSAnnotationLayer } from 'pdfjs-dist/build/pdf'
import { AnnotationType } from 'pdfjs-dist/lib/shared/util'
import { RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { FC } from 'react'

import { useDocument } from '../DocumentProvider'

interface AnnotationLayerProps {
    page: PDFPageProxy
    pageIndex: number
    containerRef: RefObject<HTMLDivElement>
    pagesRefs: RefObject<HTMLDivElement>[]
    rotation: number
    scale: number
}

export const AnnotationLayer: FC<AnnotationLayerProps> = ({ page, pageIndex, containerRef, pagesRefs, rotation, scale }) => {
    const annotationLayerRef = useRef<HTMLDivElement>(null)
    const doc = useDocument()?.doc
    const setExternalLinks = useDocument()?.setExternalLinks
    const [cachedPageIndices, setCachedPageIndices] = useState<number[]>([])

    const clear = () => {
        const container = annotationLayerRef.current
        if (!container) {
            return
        }
        while (container.firstChild) {
            container.firstChild.remove()
        }
    }

    const scrollToTop = useCallback(
        (linkPageIndex: number) => {
            if (!containerRef.current) return
            containerRef.current.scrollTop = pagesRefs[linkPageIndex].current?.offsetTop || 0
        },
        [containerRef, pagesRefs],
    )

    const goToDestinationHelper = useCallback(
        (rawDest: string, namedDest: string | null = null, explicitDest: string[]) => {
            // Dest array looks like that: <page-ref> </XYZ|/FitXXX> <args..>
            const destRef = explicitDest[0]
            let linkPageIndex: number

            if (typeof destRef === 'object' && destRef !== null) {
                linkPageIndex = cachedPageIndices[destRef]

                if (linkPageIndex === undefined) {
                    // Fetch the page reference if it's not yet available. This could
                    // only occur during loading, before all pages have been resolved.
                    doc
                        ?.getPageIndex(destRef)
                        .then((index) => {
                            setCachedPageIndices((numbers) => {
                                numbers[destRef] = index
                                return numbers
                            })
                            goToDestinationHelper(rawDest, namedDest, explicitDest)
                        })
                        .catch(() => {
                            console.error(`goToDestinationHelper: "${destRef}" is not ` + `a valid page reference, for dest="${rawDest}".`)
                        })
                    return
                }
            } else if (Number.isInteger(destRef)) {
                linkPageIndex = destRef as unknown as number
            } else {
                console.error(`goToDestinationHelper: "${destRef}" is not ` + `a valid destination reference, for dest="${rawDest}".`)
                return
            }
            if (!doc || linkPageIndex === null || linkPageIndex < 0 || linkPageIndex > doc.numPages - 1) {
                console.error(`goToDestinationHelper: "${linkPageIndex}" is not ` + `a valid page index, for dest="${rawDest}".`)
                return
            }
            scrollToTop(linkPageIndex)
        },
        [cachedPageIndices, doc, scrollToTop],
    )

    useEffect(() => {
        const container = annotationLayerRef.current
        const viewport = page.getViewport({ rotation, scale })

        page.getAnnotations().then((annotations) => {
            clear()
            PDFJSAnnotationLayer.render({
                annotations,
                div: container,
                imageResourcesPath: '/_next/static/media/annotation/',
                linkService: {
                    externalLinkTarget: 2,
                    externalLinkRel: 'nofollow',
                    externalLinkEnabled: false,
                    addLinkAttributes: (element: HTMLAnchorElement, url: string) => {
                        element.href = `javascript:alert('${url}');`
                    },
                    getDestinationHash: (dest: string | string[]) => {
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
                    goToDestination: async (dest: string | Promise<string>) => {
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
                                `PDFLinkService.goToDestination: "${explicitDest}" is not ` + `a valid destination array, for dest="${dest}".`,
                            )
                            return
                        }
                        goToDestinationHelper(dest as string, namedDest, explicitDest)
                    },
                },
                page,
                renderInteractiveForms: false,
                viewport: viewport.clone({ dontFlip: true }),
            })
            setExternalLinks?.((prevLinks) => {
                const newLinks = annotations
                    .filter((annotation) => annotation.annotationType === AnnotationType.LINK && annotation.url)
                    .map(({ url }) => ({ pageIndex, url }))

                if (newLinks.length && !prevLinks[newLinks[0].pageIndex as keyof typeof prevLinks]) {
                    prevLinks = { ...prevLinks, [newLinks[0].pageIndex]: newLinks }
                }

                return prevLinks
            })
        })
    }, [doc, goToDestinationHelper, page, pageIndex, rotation, scale, setExternalLinks])

    return <div ref={annotationLayerRef} className="annotationLayer" />
}
