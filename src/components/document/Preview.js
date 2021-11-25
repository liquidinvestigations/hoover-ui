import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PDFViewer from './pdf-viewer/Dynamic'
import TIFFViewer from './TIFFViewer'
import { useDocument } from './DocumentProvider'

// List copy/pasted from https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
// and then ran through ` grep -o '[^ /]\+/[^ ]\+' | sort ` - only image, audio, video are here
export const PREVIEWABLE_MIME_TYPE_SUFFEXES = [
    '/3gpp',
    '/3gpp2',
    '/aac',
    '/bmp',
    '/gif',
    '/jpeg',
    '/jpg',
    '/midi',
    '/mp2t',
    '/mp4',
    '/mpeg',
    '/mpeg3',
    '/msvideo',
    '/ogg',
    '/opus',
    '/pdf',
    '/pjpeg',
    '/png',
    '/svg+xml',
    '/tiff',
    '/video',
    '/vnd.microsoft.icon',
    '/wav',
    '/webm',
    '/webp',
    '/x-midi',
    '/x-mpeg-3',
    '/x-msvideo',
    '/x-troff-msvideo',
]

const useStyles = makeStyles(theme => ({
    preview: {
        height: '50vh',
        overflow: 'hidden',
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey[200],
    },
}))

function Preview() {
    const classes = useStyles()
    const { data, docRawUrl, docPreviewUrl } = useDocument()

    if (data.content['has-pdf-preview']) {
        return <PDFViewer url={docPreviewUrl} />
    }

    switch (data.content['content-type']) {
        case 'application/pdf':
            return <PDFViewer url={docRawUrl} />

        case 'image/tiff':
            return <TIFFViewer url={docRawUrl} />
    }

    return (
        <div className={classes.preview}>
            <embed
                style={{ objectFit: 'contain'}}
                src={docRawUrl}
                type={data.content['content-type']}
                height="100%"
                width="100%"
                title={data.content.filename}
            />
        </div>
    )
}

export default memo(Preview)
