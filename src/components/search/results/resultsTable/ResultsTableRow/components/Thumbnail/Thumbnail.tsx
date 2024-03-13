import { Paper, Popper } from '@mui/material'
import { cloneElement, useRef, useState } from 'react'

import { createThumbnailSrc } from '../../../../../../../backend/api'
import { reactIcons } from '../../../../../../../constants/icons'
import { Loading } from '../../../../../../common/Loading/Loading'

import { useStyles } from './Thumbnail.styles'
import { ThumbnailProps } from './Thumbnail.types'

export const Thumbnail = ({ hit }: ThumbnailProps) => {
    const { classes } = useStyles()
    const thumbRef = useRef()
    const [showPreview, setShowPreview] = useState(false)
    const [previewLoading, setPreviewLoading] = useState(true)

    const handleThumbEnter = () => {
        setShowPreview(true)
        setPreviewLoading(true)
    }
    const handleThumbLeave = () => {
        setShowPreview(false)
    }

    return (
        <>
            {cloneElement(reactIcons.visibility, {
                ref: thumbRef,
                className: classes.infoIcon,
                onMouseEnter: handleThumbEnter,
                onMouseLeave: handleThumbLeave,
            })}
            <Popper
                placeholder="Thumbnail"
                anchorEl={thumbRef.current}
                open={showPreview}
                placement="right-start"
                modifiers={[
                    {
                        name: 'preventOverflow',
                        options: {
                            boundary: 'clippingParents',
                        },
                    },
                ]}
                onResize={() => {}}
                onResizeCapture={() => {}}>
                <Paper elevation={10} className={classes.preview}>
                    {previewLoading && <Loading />}
                    <img
                        alt="preview image"
                        className={previewLoading ? classes.previewImgLoading : classes.previewImg}
                        onLoad={() => setPreviewLoading(false)}
                        src={createThumbnailSrc(`doc/${hit._collection}/${hit._id}`, 400)}
                    />
                </Paper>
            </Popper>
        </>
    )
}
