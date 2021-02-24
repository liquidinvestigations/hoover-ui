import React, { useState } from 'react'
import cn from 'classnames'
import { Toolbar } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { STATUS_COMPLETE, useDocument } from './DocumentProvider'
import Page from './Page'

const useStyles = makeStyles(theme => ({
    container: {
        height: '50vh',
        overflow: 'auto',
        boxSizing: 'content-box',
        backgroundColor: theme.palette.grey[200],
    },
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderColor: theme.palette.grey[400],
        borderWidth: 1,
        borderTopStyle: 'solid',
        borderBottomStyle: 'solid',
        justifyContent: 'space-between',
    },
}))

export default function Document({ initialPage, onPageChange }) {
    const classes = useStyles()
    const { doc, firstPageData, status } = useDocument()
    const [rotation, setRotation] = useState(0)
    const [scale, setScale] = useState(firstPageData.scale)

    return (
        <>
            <Toolbar variant="dense" classes={{root: classes.toolbar}}>

            </Toolbar>

            {status === STATUS_COMPLETE && (
                <div className={cn(classes.container, 'pdfViewer')}>
                    {Array(doc.numPages).fill(undefined).map((_, index) => {
                           return  <Page
                                key={index}
                                doc={doc}
                                pageIndex={index}
                                width={firstPageData.width}
                                height={firstPageData.height}
                                rotation={rotation}
                                scale={scale}
                            />
                        }
                    )}
                </div>
            )}
        </>
    )
}
