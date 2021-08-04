import React, { createContext, useContext, useEffect, useState } from 'react'
import { getDocument, GlobalWorkerOptions, PasswordResponses, PDFWorker } from 'pdfjs-dist/build/pdf'
import 'pdfjs-dist/build/pdf.worker'

if (typeof window !== 'undefined' && 'Worker' in window) {
    GlobalWorkerOptions.workerSrc = '/_next/static/pdf.worker.js'
}

export const STATUS_LOADING = 'loading'
export const STATUS_COMPLETE = 'complete'
export const STATUS_ERROR = 'error'
export const STATUS_NEED_PASSWORD = 'need-password'
export const STATUS_INCORRECT_PASSWORD = 'incorrect-password'

const DocumentContext = createContext(null)

export default function DocumentProvider({ url, cMaps, cMapsPacked, withCredentials, children }) {
    const [doc, setDoc] = useState(null)
    const [firstPageData, setFirstPageData] = useState({
        width: 0,
        height: 0,
        scale: 1
    })
    const [error, setError] = useState(null)
    const [percent, setPercent] = useState(0)
    const [status, setStatus] = useState(STATUS_LOADING)
    const [externalLinks, setExternalLinks] = useState({})

    useEffect(() => {
        setStatus(STATUS_LOADING)

        const worker = new PDFWorker({ name: `PDFWorker_${Date.now()}` })
        const loadingTask = getDocument({
            url,
            cMaps,
            cMapsPacked,
            withCredentials,
            worker,
        })
        loadingTask.onPassword = (verifyPassword, reason) => {
            switch (reason) {
                case PasswordResponses.NEED_PASSWORD:
                    setStatus(STATUS_NEED_PASSWORD)
                    break

                case PasswordResponses.INCORRECT_PASSWORD:
                    setStatus(STATUS_INCORRECT_PASSWORD)
                    break
            }
        }
        loadingTask.onProgress = progress => {
            progress.total > 0 ?
                setPercent(Math.min(100, 100 * progress.loaded / progress.total)) :
                setPercent(100)
        }
        loadingTask.promise.then(
            doc => {
                setDoc(doc)
                doc.getPage(1).then(page => {
                    const { width, height, scale } = page.getViewport({ scale: 1 })

                    setFirstPageData({
                        width, height, scale
                    })
                    setStatus(STATUS_COMPLETE)
                })
            },
            err => {
                setError(err)
                setStatus(STATUS_ERROR)
            }
        )

        return () => {
            loadingTask.destroy()
            worker.destroy()
        }
    }, [url])

    return (
        <DocumentContext.Provider value={{ doc, firstPageData, error, status, percent, externalLinks, setExternalLinks }}>
            {children}
        </DocumentContext.Provider>
    )
}

export const useDocument = () => useContext(DocumentContext)
