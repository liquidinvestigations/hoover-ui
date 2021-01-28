import React from 'react'
import Document from '../document/Document'
import { useSearch } from './SearchProvider'

export default function Preview() {
    const { selectedDocUrl, selectedDocData, previewNextDoc, previewPreviousDoc, previewLoading } = useSearch()

    return (
        <Document
            docUrl={selectedDocUrl}
            data={selectedDocData}
            loading={previewLoading}
            onPrev={previewPreviousDoc}
            onNext={previewNextDoc}
        />
    )
}
