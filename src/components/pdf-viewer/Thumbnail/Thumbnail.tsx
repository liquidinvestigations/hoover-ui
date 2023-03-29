import { observer } from 'mobx-react-lite'
import { FC, useEffect, useState } from 'react'

import { PDFPageData } from '../../../stores/PDFViewerStore'
import { useSharedStore } from '../../SharedStoreProvider'
import { ThumbnailLayer } from '../layers/ThumbnailLayer/ThumbnailLayer'

import { useStyles, thumbnailWidth, thumbnailHeight } from './Thumbnail.styles'

export const Thumbnail: FC<{ thumbnailIndex: number }> = observer(({ thumbnailIndex }) => {
    const { classes, cx } = useStyles()
    const { containerRef, doc, pageIndex, firstPageProps, thumbnailsRefs, setThumbnailRef, rotation, goToPage } = useSharedStore().pdfViewerStore

    const [shouldScroll, setShouldScroll] = useState(true)
    const [pageData, setPageData] = useState<PDFPageData>({
        page: undefined,
        width: firstPageProps?.width,
        height: firstPageProps?.height,
        rotation,
    })

    const [visible, setVisible] = useState(false)

    const thumbnailRef = thumbnailsRefs[thumbnailIndex]
    const selected = pageIndex === thumbnailIndex

    const getPageData = () => {
        doc?.getPage(thumbnailIndex + 1).then((page) => {
            const { width, height, rotation } = page.getViewport({ scale: 1 })

            setPageData({
                page,
                width,
                height,
                rotation,
            })
        })
    }

    useEffect(() => {
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
            }
        )

        observer.observe(thumbnailRef)

        return () => {
            observer.unobserve(thumbnailRef)
        }
    })

    useEffect(() => {
        if (selected && shouldScroll && containerRef) {
            containerRef.scrollTop = thumbnailRef.offsetTop - 48
            setShouldScroll(false)
        }
    }, [containerRef, selected, shouldScroll, thumbnailRef.offsetTop])

    const handleClick = () => {
        setShouldScroll(false)
        goToPage(thumbnailIndex)
    }

    const { page, width: pageWidth, height: pageHeight } = pageData

    return (
        <div ref={setThumbnailRef(thumbnailIndex)} className={classes.thumbnail} onClick={handleClick}>
            <div className={cx(classes.thumbnailSelection, { [classes.selected]: selected })}>
                {visible && page && (
                    <ThumbnailLayer
                        page={page}
                        pageWidth={pageWidth as number}
                        pageHeight={pageHeight as number}
                        rotation={rotation}
                        thumbnailWidth={thumbnailWidth}
                        thumbnailHeight={thumbnailHeight}
                    />
                )}
            </div>
        </div>
    )
})
