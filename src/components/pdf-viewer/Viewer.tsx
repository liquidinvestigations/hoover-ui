import { FC, useEffect, useState } from 'react'

import { X_HOOVER_PDF_SPLIT_PAGE_RANGE } from '../../backend/api'
import { useSharedStore } from '../SharedStoreProvider'

import { Document } from './Document/Document'
import { DocumentProvider } from './DocumentProvider'

// remove Function type as it is banned
// eslint-disable-next-line @typescript-eslint/ban-types
function debounce(fn: Function, wait: number) {
    let t: ReturnType<typeof setTimeout>
    return function (...args: any[]) {
        clearTimeout(t)
        t = setTimeout(() => fn(...args), wait)
    }
}

interface ViewerProps {
    url: string
    cMapUrl?: string
    cMapPacked?: boolean
    withCredentials?: boolean
}

export const Viewer: FC<ViewerProps> = ({ url, cMapUrl = '/build/static/cmaps', cMapPacked = true, withCredentials = true }) => {
    const {
        hashStore: { hashState, setHashState },
        documentStore: { chunkTab, pdfDocumentInfo },
    } = useSharedStore()
    const [pageIndex, setPageIndex] = useState(0)

    useEffect(() => {
        if (hashState.previewPage) {
            const previewPage = parseInt(hashState.previewPage)
            if (!isNaN(previewPage)) {
                setPageIndex(previewPage - 1)
            } else {
                setPageIndex(0)
            }
        }
    }, [hashState.previewPage])

    const onPageIndexChange = debounce((index: number) => {
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

export default Viewer
