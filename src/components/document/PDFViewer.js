import React, { useState } from 'react'
import { makeStyles } from '@material-ui/core/styles'
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack'

const useStyles = makeStyles(theme => ({
    preview: {
        height: '50vh',
        overflow: 'auto',
        textAlign: 'center',
    },
    page: {
        overflow: 'hidden',
        display: 'inline-block',
    }
}))

export default function PDFViewer({ url }) {
    const classes = useStyles()
    const [numPages, setNumPages] = useState(null)
    const [pageNumber, setPageNumber] = useState(1)

    const onLoadSuccess = (page) => {
        setNumPages(page.numPages)
    }

    const onGetTextSuccess = items => {
        console.log(items)
    }

    return (
        <div className={classes.preview}>
            <div className={classes.page}>
                <Document
                    file={url}
                    onLoadSuccess={onLoadSuccess}
                    options={{
                        cMapUrl: 'cmaps/',
                        cMapPacked: true,
                    }}
                >
                    <Page
                        pageNumber={pageNumber}
                        onGetTextSuccess={onGetTextSuccess}
                    />
                </Document>
                <p>Page {pageNumber} of {numPages}</p>
            </div>
        </div>
    )
}
