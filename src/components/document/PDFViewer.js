import React from 'react'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    preview: {
        overflow: 'hidden',
        height: '50vh',
    },
}))

export default function PDFViewer({ url }) {
    const classes = useStyles()
    const pdfViewerUrl = `/viewer/web/viewer.html?file=${encodeURIComponent(url)}`

    return (
        <div id="hoover-pdf-viewer-container" className={classes.preview}>
            <iframe
                src={pdfViewerUrl}
                height="100%"
                width="100%"
                allowFullScreen={true}
            />
        </div>
    )
}
