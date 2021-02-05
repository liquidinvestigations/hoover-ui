import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
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

const useStyles = makeStyles({
    preview: {
        overflow: 'hidden',
        height: '50vh',
    },
})

function Preview() {
    const classes = useStyles()
    const { data, docRawUrl } = useDocument()

    if (data.content['content-type'] === 'application/pdf') {
        const pdfViewerUrl = `/viewer/web/viewer.html?file=${encodeURIComponent(docRawUrl)}`
        return (
            <>
                <p> Annotate this document in the <a target="_blank" href={pdfViewerUrl}>PDF viewer</a>. </p>
                <div id="hoover-pdf-viewer-container" className={classes.preview}>
                    <iframe
                        src={pdfViewerUrl}
                        height="100%"
                        width="100%"
                        allowFullScreen={true}
                    />
                </div>
            </>
        )
    }

    return (
        <div id="hoover-media-viewer-container" className={classes.preview}>
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
