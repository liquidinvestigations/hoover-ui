import React, { createContext, useContext, useEffect, useState } from 'react'
import { useHashState } from '../HashStateProvider'
import { TagsProvider } from './TagsProvider'
import { collectionUrl, documentViewUrl } from '../../utils'
import { createDownloadUrl, createPreviewUrl, createThumbnailSrcSet, doc as docAPI } from '../../backend/api'

const DocumentContext = createContext({})

export function DocumentProvider({ children, collection, collections, id, path, fullPage, printMode }) {
    const [data, setData] = useState()
    const [error, setError] = useState(null)
    const [pathname, setPathname] = useState()
    const [loading, setLoading] = useState(true)

    const [digest, setDigest] = useState()
    const [digestUrl, setDigestUrl] = useState()
    const [docRawUrl, setDocRawUrl] = useState()
    const [docPreviewUrl, setDocPreviewUrl] = useState()
    const [thumbnailSrcSet, setThumbnailSrcSet] = useState()
    const [urlIsSha, setUrlIsSha] = useState(true)

    const [ocrData, setOcrData] = useState()
    const [tab, setTab] = useState(0)
    const [subTab, setSubTab] = useState(0)
    const { hashState, setHashState } = useHashState()

    const collectionBaseUrl = collectionUrl(collection)

    useEffect(() => {
        if ((collection && id) || path) {
            setTab(parseInt(hashState?.tab) || 0)
            const newPath = path || documentViewUrl({ _collection: collection, _id: id })
            setPathname(newPath)
            setLoading(true)
            setError(null)
            if (!newPath.includes('_file_') && !newPath.includes('_directory_')) {
                setDigestUrl(newPath)
                setUrlIsSha(true)
            }
            docAPI(newPath).then(data => {
                if (data.id.startsWith('_')) {
                    if (data.id.startsWith('_file_')) {
                        setDigest(data.digest)
                        setDigestUrl(`${collectionBaseUrl}/${data.digest}`)
                        setDocRawUrl(createDownloadUrl(
                            `${collectionBaseUrl}/${data.digest}`, data.content.filename
                        ))
                        setDocPreviewUrl(createPreviewUrl(`${collectionBaseUrl}/${data.digest}`))
                        setThumbnailSrcSet(createThumbnailSrcSet(`${collectionBaseUrl}/${data.digest}`))
                        setUrlIsSha(false)
                    }
                    if (data.id.startsWith('_directory_')) {
                        setDigest(null)
                        setDocRawUrl(null)
                        setDocPreviewUrl(null)
                        setThumbnailSrcSet(null)
                        setUrlIsSha(false)
                    }
                } else {
                    setDigest(data.id)
                    setDocRawUrl(createDownloadUrl(
                        `${collectionBaseUrl}/${data.id}`, data.content.filename
                    ))
                    setDocPreviewUrl(createPreviewUrl(`${collectionBaseUrl}/${data.id}`))
                    setThumbnailSrcSet(createThumbnailSrcSet(`${collectionBaseUrl}/${data.id}`))
                }
                setData(data)

                const ocr = Object.keys(data.content.ocrtext || {}).map((tag, index) => {
                    return {tag: tag, text: data.content.ocrtext[tag]}
                })
                setOcrData(ocr)

                const subTabState = parseInt(hashState?.subTab)
                if (!isNaN(subTabState)) {
                    setSubTab(subTabState)
                } else {
                    if (!data.content.text?.length && ocr.length) {
                        setSubTab(1)
                    } else {
                        setSubTab(0)
                    }
                }
            }).catch(res => {
                setError({ status: res.status, statusText: res.statusText, url: res.url })
            }).finally(() => {
                setLoading(false)
            })
        } else {
            setData(null)
            setLoading(false)
        }
    }, [collection, id, path])

    useEffect(() => {
        if (typeof hashState?.tab !== 'undefined') {
            setTab(parseInt(hashState.tab))
        }
        if (typeof hashState?.subTab !== 'undefined') {
            setSubTab(parseInt(hashState.subTab))
        }
    }, [hashState?.tab, hashState?.subTab])

    const handleTabChange = (event, newValue) => {
        setTab(newValue)
        setHashState({ tab: newValue }, false)
    }
    const handleSubTabChange = (event, newValue) => {
        setSubTab(newValue)
        setHashState({ subTab: newValue }, false)
    }

    return (
        <DocumentContext.Provider value={{
            data, pathname, loading, error,
            ocrData, fullPage, printMode,
            collection, collections, collectionBaseUrl,
            digest, digestUrl, urlIsSha,
            docRawUrl, docPreviewUrl, thumbnailSrcSet,
            tab, handleTabChange,
            subTab, handleSubTabChange,
        }}>
            <TagsProvider>
                {children}
            </TagsProvider>
        </DocumentContext.Provider>
    )
}

export const useDocument = () => useContext(DocumentContext)
