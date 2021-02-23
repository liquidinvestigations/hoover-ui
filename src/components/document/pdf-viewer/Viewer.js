import React from 'react'
import Document from './Document'
import DocumentProvider from './DocumentProvider'

export default function Viewer({
    url,
    initialPage = 0,
    cMapUrl = '/build/static/cmaps',
    cMapPacked = true,
    withCredentials = true,
    onPageChange = () => {},
}) {
    return (
        <DocumentProvider
            url={url}
            cMapUrl={cMapUrl}
            cMapPacked={cMapPacked}
            withCredentials={withCredentials}
        >
            <Document
                initialPage={initialPage}
                onPageChange={onPageChange}
            />
        </DocumentProvider>
    )
}
