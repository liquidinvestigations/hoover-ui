import { getDocument, GlobalWorkerOptions, PasswordResponses, PDFWorker } from 'pdfjs-dist/build/pdf'
import { OnProgressParameters, PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api'
import { createContext, Dispatch, FC, ReactElement, SetStateAction, useContext, useEffect, useState } from 'react'

import { fetchWithHeaders } from '../../backend/api'

if ('Worker' in window) {
    GlobalWorkerOptions.workerSrc = '/_next/static/pdf.worker.js'
}

export const STATUS_LOADING = 'loading'
export const STATUS_COMPLETE = 'complete'
export const STATUS_ERROR = 'error'
export const STATUS_NEED_PASSWORD = 'need-password'
export const STATUS_INCORRECT_PASSWORD = 'incorrect-password'

export interface ExternalLink {
    pageIndex: number
    url: string
}

export interface BookmarkItem {
    title: string
    dest: string
    index: number
    items: BookmarkItem[]
}

interface DocumentProviderData {
    doc: PDFDocumentProxy | null
    firstPageData: FirstPageData
    error: { message?: string }
    status: string
    percent: number
    bookmarks: BookmarkItem[]
    setBookmarks: Dispatch<SetStateAction<BookmarkItem[]>>
    externalLinks: Record<string, ExternalLink[]>
    setExternalLinks: Dispatch<SetStateAction<object>>
}

export interface FirstPageData {
    width: number
    height: number
    scale: number
}

const DocumentContext = createContext<DocumentProviderData | null>(null)

interface DocumentProviderProps {
    url: string
    cMapUrl: string
    cMapPacked: boolean
    withCredentials: boolean
    children: ReactElement
}

export const DocumentProvider: FC<DocumentProviderProps> = ({ url, cMapUrl, cMapPacked, withCredentials, children }) => {
    const [doc, setDoc] = useState<PDFDocumentProxy | null>(null)
    const [firstPageData, setFirstPageData] = useState({
        width: 0,
        height: 0,
        scale: 1,
    })
    const [error, setError] = useState({})
    const [percent, setPercent] = useState(0)
    const [status, setStatus] = useState(STATUS_LOADING)
    const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([])
    const [externalLinks, setExternalLinks] = useState({})

    useEffect(() => {
        setStatus(STATUS_LOADING)
        const worker = new PDFWorker({ name: `PDFWorker_${Date.now()}` })
        let loadingTask: PDFDocumentLoadingTask

        fetchWithHeaders(url).then(() => {
            loadingTask = getDocument({
                url,
                cMapUrl,
                cMapPacked,
                withCredentials,
                worker,
            })
            loadingTask.onPassword = (verifyPassword: () => void, reason: typeof PasswordResponses) => {
                switch (reason) {
                    case PasswordResponses.NEED_PASSWORD:
                        setStatus(STATUS_NEED_PASSWORD)
                        break

                    case PasswordResponses.INCORRECT_PASSWORD:
                        setStatus(STATUS_INCORRECT_PASSWORD)
                        break
                }
            }
            loadingTask.onProgress = (progress: OnProgressParameters) => {
                progress.total > 0 ? setPercent(Math.min(100, (100 * progress.loaded) / progress.total)) : setPercent(100)
            }
            loadingTask.promise.then(
                (doc) => {
                    setDoc(doc)
                    doc.getPage(1).then((page) => {
                        const { width, height, scale } = page.getViewport({ scale: 1 })

                        setFirstPageData({
                            width,
                            height,
                            scale,
                        })
                        setStatus(STATUS_COMPLETE)
                    })
                },
                (err) => {
                    setError(err)
                    setStatus(STATUS_ERROR)
                },
            )
        })

        return () => {
            loadingTask?.destroy?.()
            worker?.destroy?.()
        }
    }, [cMapPacked, cMapUrl, url, withCredentials])

    return (
        <DocumentContext.Provider
            value={{
                doc,
                firstPageData,
                error,
                status,
                percent,
                bookmarks,
                setBookmarks,
                externalLinks,
                setExternalLinks,
            }}>
            {children}
        </DocumentContext.Provider>
    )
}

export const useDocument = () => useContext(DocumentContext)
