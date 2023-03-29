import { observer } from 'mobx-react-lite'
import { PDFPageProxy, AnnotationLayer as PDFJSAnnotationLayer } from 'pdfjs-dist'
import { AnnotationType } from 'pdfjs-dist/types/src/shared/util'
import { IPDFLinkService } from 'pdfjs-dist/types/web/interfaces'
import { FC, RefObject, useEffect, useRef, useState } from 'react'

import { useSharedStore } from '../../SharedStoreProvider'

interface AnnotationLayerProps {
    page: PDFPageProxy
    pageIndex: number
    containerRef: HTMLDivElement
    pagesRefs: HTMLDivElement[]
    rotation: number
    scale: number
}

export const AnnotationLayer: FC<AnnotationLayerProps> = observer(({ page, pageIndex, containerRef, pagesRefs, rotation, scale }) => {
    const annotationLayerRef: RefObject<HTMLDivElement> = useRef(null)
    const { doc, setExternalLinks } = useSharedStore().pdfViewerStore
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

    const goToDestinationHelper = (rawDest: string | string[], namedDest: string | string[] | null = null, explicitDest: number[] | string[]) => {
        // Dest array looks like that: <page-ref> </XYZ|/FitXXX> <args..>
        const destRef = explicitDest[0]
        let linkPageIndex: number

        if (typeof destRef === 'object' && destRef !== null) {
            linkPageIndex = cachedPageIndices[destRef]

            if (doc && linkPageIndex === undefined) {
                // Fetch the page reference if it's not yet available. This could
                // only occur during loading, before all pages have been resolved.
                doc.getPageIndex(destRef)
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
            linkPageIndex = destRef as number
        } else {
            console.error(`goToDestinationHelper: "${destRef}" is not ` + `a valid destination reference, for dest="${rawDest}".`)
            return
        }
        if (linkPageIndex === null || linkPageIndex < 0 || linkPageIndex > (doc?.numPages || 0) - 1) {
            console.error(`goToDestinationHelper: "${linkPageIndex}" is not ` + `a valid page index, for dest="${rawDest}".`)
            return
        }

        containerRef.scrollTop = pagesRefs[linkPageIndex].offsetTop
    }

    useEffect(() => {
        const container = annotationLayerRef.current

        if (!container) {
            return
        }

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
                    goToDestination: async (dest: string | string[]) => {
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
                                `PDFLinkService.goToDestination: "${explicitDest}" is not ` + `a valid destination array, for dest="${dest}".`
                            )
                            return
                        }
                        goToDestinationHelper(dest, namedDest, explicitDest)
                    },
                } as unknown as IPDFLinkService,
                page,
                renderForms: false,
                viewport: viewport.clone({ dontFlip: true }),
                downloadManager: null,
            })

            const newLinks = annotations
                .filter((annotation) => annotation.annotationType === AnnotationType.LINK && annotation.url)
                .map(({ url }) => ({ pageIndex, url }))

            setExternalLinks(newLinks[0].pageIndex, newLinks)
        })
    }, [rotation, scale])

    return <div ref={annotationLayerRef} className="annotationLayer" />
})
