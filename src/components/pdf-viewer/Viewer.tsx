import { FC, useEffect, useState } from 'react'

import { useSharedStore } from '../SharedStoreProvider'

import { Document } from './Document/Document'
import { DocumentProvider } from './DocumentProvider'

// remove Function type as it is banned
// eslint-disable-next-line @typescript-eslint/ban-types
function debounce(fn: Function, wait: number) {
    let t: ReturnType<typeof setTimeout>
    return function (...args: []) {
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

    return (
        <DocumentProvider url={url} cMapUrl={cMapUrl} cMapPacked={cMapPacked} withCredentials={withCredentials}>
            <Document initialPageIndex={pageIndex} onPageIndexChange={onPageIndexChange} />
        </DocumentProvider>
    )
}

export default Viewer
