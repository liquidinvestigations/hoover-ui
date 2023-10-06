import { FC, memo, RefObject } from 'react'
import { makeStyles } from 'tss-react/mui'

import { useDocument } from '../DocumentProvider'

import { Thumbnail } from './Thumbnail'

const useStyles = makeStyles()(() => ({
    container: {
        padding: '10px 30px 0',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
}))

interface ThumbnailsViewProps {
    containerRef: RefObject<HTMLDivElement>
    thumbnailsRefs: RefObject<HTMLDivElement>[]
    rotation: number
    currentPageIndex: number
    onSelect: (index: number) => void
}

export const ThumbnailsView: FC<ThumbnailsViewProps> = ({ containerRef, thumbnailsRefs, rotation, currentPageIndex, onSelect }) => {
    const { classes } = useStyles()
    const doc = useDocument()?.doc

    return (
        <div className={classes.container}>
            {Array(doc?.numPages)
                .fill(0)
                .map((_, index) => (
                    <Thumbnail
                        key={index}
                        ref={thumbnailsRefs[index]}
                        containerRef={containerRef}
                        pageIndex={index}
                        rotation={rotation}
                        selected={index === currentPageIndex}
                        onSelect={onSelect}
                    />
                ))}
            <div style={{ clear: 'left' }} />
        </div>
    )
}
