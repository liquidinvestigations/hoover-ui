import React, { useEffect, useState } from 'react'
import Document from './Document'
import DocumentProvider from './DocumentProvider'
import { useHashState } from '../../HashStateProvider'
import { debounce } from '../../../utils'

export default function Viewer({
    url,
    cMapUrl = '/build/static/cmaps',
    cMapPacked = true,
    withCredentials = true,
}) {
    const { hashState, setHashState } = useHashState()
    const [pageIndex, setPageIndex] = useState(0)

    useEffect(() => {
        const previewPage = parseInt(hashState?.previewPage)
        if (!isNaN(previewPage)) {
            setPageIndex(previewPage - 1)
        } else {
            setPageIndex(0)
        }
    }, [hashState?.previewPage])

    const onPageIndexChange = debounce(index => {
        if (index > 0) {
            setHashState({ previewPage: index + 1 }, false)
        } else {
            setHashState({ previewPage: undefined }, false)
        }
    }, 300)

    return (
        <DocumentProvider
            url={url}
            cMapUrl={cMapUrl}
            cMapPacked={cMapPacked}
            withCredentials={withCredentials}
        >
            <Document
                initialPageIndex={pageIndex}
                onPageIndexChange={onPageIndexChange}
            />
        </DocumentProvider>
    )
}
