import React, { memo } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import Section from './Section'

// List copy/pasted from https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types
// and then ran through ` grep -o '[^ /]\+/[^ ]\+' | sort ` - only image, audio, video are here
const PREVIEWABLE_MIME_TYPE_SUFFEXES = [
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

function PreviewSection({ type, url, title, docTitle }) {
    const classes = useStyles()

    if (!type || !url) return null;

    let preview = null;
    if (type === 'application/pdf') {
        const pdfViewerUrl = `/viewer/web/viewer.html?file=${encodeURIComponent(url)}`
        preview = (
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
    } else if (PREVIEWABLE_MIME_TYPE_SUFFEXES.some(x => type.endsWith(x))) {
        preview = (
            <div id="hoover-media-viewer-container" className={classes.preview}>
                <embed
                    style={{ objectFit: 'contain'}}
                    src={url}
                    type={type}
                    height="100%"
                    width="100%"
                    title={docTitle}
                />
            </div>
        )
    } else {
        return null
    }

    return (
        <Section title={title}>
            {preview}
        </Section>
    )
}

export default memo(PreviewSection)
