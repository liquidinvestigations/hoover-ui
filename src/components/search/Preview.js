import React from 'react'
import Document from '../document/Document'
import { useSearch } from './SearchProvider'
import { DocumentProvider } from '../document/DocumentProvider'

export default function Preview() {
    const { selectedDocData, previewNextDoc, previewPreviousDoc } = useSearch()

    return (
        <DocumentProvider
            id={selectedDocData?.i}
            collection={selectedDocData?.c}
        >
            <Document
                onPrev={previewPreviousDoc}
                onNext={previewNextDoc}
            />
        </DocumentProvider>
    )
}
