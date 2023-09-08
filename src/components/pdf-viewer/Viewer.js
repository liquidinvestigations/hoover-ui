import { useEffect, useState } from 'react'

import { X_HOOVER_PDF_SPLIT_PAGE_RANGE } from '../../backend/api'
import { useSharedStore } from '../SharedStoreProvider'

import Document from './Document'
import DocumentProvider from './DocumentProvider'

function debounce(fn, wait) {
    let t
    return function () {
        clearTimeout(t)
        t = setTimeout(() => fn.apply(this, arguments), wait)
    }
}

export default function Viewer({ url, cMapUrl = '/build/static/cmaps', cMapPacked = true, withCredentials = true }) {
    const {
        hashStore: { hashState, setHashState },
        documentStore: {
            chunkTab,
            pdfDocumentInfo,
        },
    } = useSharedStore()
    const [pageIndex, setPageIndex] = useState(0)

    useEffect(() => {
        const previewPage = parseInt(hashState?.previewPage)
        if (!isNaN(previewPage)) {
            setPageIndex(previewPage - 1)
        } else {
            setPageIndex(0)
        }
    }, [hashState?.previewPage])

    const onPageIndexChange = debounce((index) => {
        if (index > 0) {
            setHashState({ previewPage: index + 1 }, false)
        } else {
            setHashState({ previewPage: undefined }, false)
        }
    }, 300)

    const getDocumentUrl = () => {
        const { chunks } = pdfDocumentInfo ?? {}
        if (!chunks || chunks.length < 2) return url
        return `${url}?${X_HOOVER_PDF_SPLIT_PAGE_RANGE}=${chunks[chunkTab]}`
    }

    return (
        <DocumentProvider url={getDocumentUrl()} cMapUrl={cMapUrl} cMapPacked={cMapPacked} withCredentials={withCredentials}>
            <Document initialPageIndex={pageIndex} onPageIndexChange={onPageIndexChange} />
        </DocumentProvider>
    )
}
