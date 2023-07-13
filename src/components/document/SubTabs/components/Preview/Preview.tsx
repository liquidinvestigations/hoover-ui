import { FC, useEffect } from 'react'

import PDFViewer from '../../../../pdf-viewer/Dynamic'
import { useSharedStore } from '../../../../SharedStoreProvider'
import { TIFFViewer } from '../TIFFViewer/TIFFViewer'

import { useStyles } from './Preview.styles'

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

export const Preview: FC = () => {
    const { classes } = useStyles()
    const {
        documentStore: {
            data,
            docRawUrl,
            docPreviewUrl,
            documentSearchStore: { setActiveSearch, pdfSearchStore },
        },
    } = useSharedStore()
    
    useEffect(() => {
        setActiveSearch(pdfSearchStore)
    }, [setActiveSearch, pdfSearchStore])

    if (data?.content['has-pdf-preview']) {
        return <PDFViewer url={docPreviewUrl} />
    }

    if (data?.content.filetype === 'video') {
        return (
            <div className={classes.preview}>
                <video controls style={{ objectFit: 'contain' }} width="100%" height="100%">
                    <source src={docRawUrl} type={data?.content['content-type']} />
                </video>
            </div>
        )
    }

    if (data?.content.filetype === 'audio') {
        return (
            <div className={classes.preview} style={{ height: '90px' }}>
                <audio controls style={{ width: '100%' }}>
                    <source src={docRawUrl} type={data?.content['content-type']} />
                </audio>
            </div>
        )
    }

    switch (data?.content['content-type']) {
        case 'application/pdf':
            return <PDFViewer url={docRawUrl} />

        case 'image/tiff':
            return docRawUrl ? <TIFFViewer url={docRawUrl} /> : null
    }

    return (
        <div className={classes.preview}>
            <embed
                style={{ objectFit: 'contain' }}
                src={docRawUrl}
                type={data?.content['content-type']}
                height="100%"
                width="100%"
                title={data?.content.filename[0] ?? ''}
            />
        </div>
    )
}
