import { PDFPageProxy } from 'pdfjs-dist'
import { FC, forwardRef, RefObject, useEffect, useState } from 'react'
import { makeStyles } from 'tss-react/mui'

import { useDocument } from '../DocumentProvider'
import { ThumbnailLayer } from '../layers/ThumbnailLayer'

const thumbnailWidth = 100
const thumbnailHeight = 150

const useStyles = makeStyles()(() => ({
    thumbnail: {
        float: 'left',
        margin: '0 10px 5px',
    },
    thumbnailSelection: {
        padding: 7,
        borderRadius: 2,
        width: `${thumbnailWidth}px`,
        height: `${thumbnailHeight}px`,
        '&$selected': {
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            backgroundClip: 'padding-box',
        },
    },
    selected: {},
}))

interface PageData {
    page: PDFPageProxy | null
    width: number
    height: number
    rotation: number
}

interface ThumbnailProps {
    containerRef: RefObject<HTMLDivElement>
    pageIndex: number
    rotation: number
    selected: boolean
    onSelect: (index: number) => void
}

export const Thumbnail = forwardRef<HTMLDivElement, ThumbnailProps>(({ containerRef, pageIndex, rotation, selected, onSelect }, thumbnailRef) => {
    const { classes, cx } = useStyles()
    const doc = useDocument()?.doc
    const firstPageData = useDocument()?.firstPageData
    const [shouldScroll, setShouldScroll] = useState(true)
    const [pageData, setPageData] = useState<PageData>({
        page: null,
        width: firstPageData?.width || 0,
        height: firstPageData?.height || 0,
        rotation,
    })

    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const getPageData = () => {
            doc?.getPage(pageIndex + 1).then((page) => {
                const { width, height, rotation } = page.getViewport({ scale: 1 })

                setPageData({
                    page,
                    width,
                    height,
                    rotation,
                })
            })
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (pageData.page === null) {
                            getPageData()
                        }
                    }
                    setVisible(entry.isIntersecting)
                })
            },
            {
                threshold: Array(10)
                    .fill(0)
                    .map((_, i) => i / 10),
            },
        )
        const ref = (thumbnailRef as RefObject<HTMLDivElement>).current
        if (ref) {
            observer.observe(ref)

            return () => {
                observer.unobserve(ref)
            }
        }
    }, [doc, pageData.page, pageIndex, thumbnailRef])

    useEffect(() => {
        if (selected && shouldScroll && containerRef.current && thumbnailRef !== null) {
            containerRef.current.scrollTop = (thumbnailRef as RefObject<HTMLDivElement>).current?.offsetTop || 0 - 48
            setShouldScroll(false)
        }
    }, [containerRef, selected, shouldScroll, thumbnailRef])

    const handleClick = () => {
        setShouldScroll(false)
        onSelect(pageIndex)
    }

    const { page, width: pageWidth, height: pageHeight } = pageData

    return (
        <div ref={thumbnailRef} className={classes.thumbnail} onClick={handleClick}>
            <div className={cx(classes.thumbnailSelection, { [classes.selected]: selected })}>
                {visible && page && (
                    <ThumbnailLayer
                        page={page}
                        pageWidth={pageWidth}
                        pageHeight={pageHeight}
                        rotation={rotation}
                        thumbnailWidth={thumbnailWidth}
                        thumbnailHeight={thumbnailHeight}
                    />
                )}
            </div>
        </div>
    )
})
