import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import PDFViewer from './pdf-viewer/Dynamic'
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
    const { data, docRawUrl } = useDocument()

    if (data.content['content-type'] === 'application/pdf') {
        return <PDFViewer url={docRawUrl} />
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
