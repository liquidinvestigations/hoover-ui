import React from 'react'
import { Fab, Tooltip } from '@material-ui/core'
import { Launch } from '@material-ui/icons'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    preview: {
        overflow: 'hidden',
        height: '50vh',
    },
    buttonContainer: {
        display: 'flex',
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
        justifyContent: 'flex-start',
    },
    button: {
        flex: 'none',
        boxShadow: 'none',
    }
}))

export default function PDFViewer({ url }) {
    const classes = useStyles()
    const pdfViewerUrl = `/viewer/web/viewer.html?file=${encodeURIComponent(url)}`
    const handleClick = () => window.open(pdfViewerUrl)

    return (
        <>
            <div className={classes.buttonContainer}>
                <Tooltip title="Annotate this document in the PDF viewer">
                    <Fab
                        size="small"
                        color="primary"
                        onClick={handleClick}
                        className={classes.button}
                    >
                        <Launch />
                    </Fab>
                </Tooltip>
            </div>

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
