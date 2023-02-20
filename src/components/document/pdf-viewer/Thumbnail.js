import { makeStyles } from '@mui/styles'
import cx from 'classnames'
import { forwardRef, useEffect, useState } from 'react'

import { useDocument } from './DocumentProvider'
import ThumbnailLayer from './layers/ThumbnailLayer'

const thumbnailWidth = 100
const thumbnailHeight = 150

const useStyles = makeStyles((theme) => ({
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

export default forwardRef(function Thumbnail({ containerRef, pageIndex, rotation, selected, onSelect }, thumbnailRef) {
    const classes = useStyles()
    const { doc, firstPageData } = useDocument()
    const [shouldScroll, setShouldScroll] = useState(true)
    const [pageData, setPageData] = useState({
        page: null,
        width: firstPageData.width,
        height: firstPageData.height,
        rotation,
    })

    const [visible, setVisible] = useState(false)

    const getPageData = () => {
        doc.getPage(pageIndex + 1).then((page) => {
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
                    .fill()
                    .map((_, i) => i / 10),
            }
        )
        const ref = thumbnailRef.current
        observer.observe(ref)

        return () => {
            observer.unobserve(ref)
        }
    }, [])

    useEffect(() => {
        if (selected && shouldScroll) {
            containerRef.current.scrollTop = thumbnailRef.current.offsetTop - 48
            setShouldScroll(false)
        }
    }, [selected])

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
