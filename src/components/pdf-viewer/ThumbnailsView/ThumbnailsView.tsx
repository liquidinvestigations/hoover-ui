import { observer } from 'mobx-react-lite'
import { FC } from 'react'

import { useSharedStore } from '../../SharedStoreProvider'
import { Thumbnail } from '../Thumbnail/Thumbnail'

import { useStyles } from './ThumbnailsView.styles'

export const ThumbnailsView: FC = observer(() => {
    const { classes } = useStyles()
    const { doc } = useSharedStore().pdfViewerStore

    return (
        <div className={classes.container}>
            {Array(doc?.numPages)
                .fill(0)
                .map((_, index) => (
                    <Thumbnail key={index} thumbnailIndex={index} />
                ))}
            <div style={{ clear: 'left' }} />
        </div>
    )
})
