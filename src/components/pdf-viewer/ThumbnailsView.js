import { memo } from 'react'
import { makeStyles } from 'tss-react/mui'

import { useDocument } from './DocumentProvider'
import Thumbnail from './Thumbnail'

const useStyles = makeStyles()(() => ({
    container: {
        padding: '10px 30px 0',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
}))

function ThumbnailsView({ containerRef, thumbnailsRefs, rotation, currentPageIndex, shouldScroll, onSelect }) {
    const { classes } = useStyles()
    const { doc } = useDocument()

    return (
        <div className={classes.container}>
            {Array(doc.numPages)
                .fill()
                .map((_, index) => (
                    <Thumbnail
                        key={index}
                        ref={thumbnailsRefs[index]}
                        containerRef={containerRef}
                        pageIndex={index}
                        rotation={rotation}
                        selected={index === currentPageIndex}
                        shouldScroll={shouldScroll}
                        onSelect={onSelect}
                    />
                ))}
            <div style={{ clear: 'left' }} />
        </div>
    )
}

export default memo(ThumbnailsView)
