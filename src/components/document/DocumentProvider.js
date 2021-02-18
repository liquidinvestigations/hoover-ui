import React, { createContext, useContext, useEffect, useState } from 'react'
import { useHashState } from '../HashStateProvider'
import { collectionUrl, documentViewUrl } from '../../utils'
import { createDownloadUrl, createTag, deleteTag, doc as docAPI, tags as tagsAPI, updateTag } from '../../backend/api'
import { publicTagsList } from '../../constants/specialTags'

const DocumentContext = createContext({})

export function DocumentProvider({ children, collection, id, path, fullPage, printMode, setHash }) {
    const [data, setData] = useState()
    const [pathname, setPathname] = useState()
    const [loading, setLoading] = useState(true)

    const [digest, setDigest] = useState()
    const [digestUrl, setDigestUrl] = useState()
    const [docRawUrl, setDocRawUrl] = useState()
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
                        setUrlIsSha(false)
                    }
                    if (data.id.startsWith('_directory_')) {
                        setDigest(null)
                        setDocRawUrl(null)
                        setUrlIsSha(false)
                    }
                } else {
                    setDigest(data.id)
                    setDocRawUrl(createDownloadUrl(
                        `${collectionBaseUrl}/${data.id}`, data.content.filename
                    ))
                }
                setData(data)

                const ocr = Object.keys(data.content.ocrtext || {}).map((tag, index) => {
                    return {tag: tag, text: data.content.ocrtext[tag]}
                })
                setOcrData(ocr)

                if (hashState?.subTab) {
                    setSubTab(parseInt(hashState.subTab))
                } else {
                    if (ocr.length) {
                        setSubTab(1)
                    } else {
                        setSubTab(0)
                    }
                }
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
    }, [hashState])

    const handleTabChange = (event, newValue) => {
        setTab(newValue)
        setHashState({ tab: newValue }, false)
    }
    const handleSubTabChange = (event, newValue) => {
        setSubTab(newValue)
        setHashState({ subTab: newValue }, false)
    }

    const [tags, setTags] = useState([])
    const [tagsLocked, setTagsLocked] = useState(false)
    const [tagsLoading, setTagsLoading] = useState(true)

    useEffect(() => {
        if (digestUrl) {
            setTagsLoading(true)
            setTagsLocked(true)
            tagsAPI(digestUrl).then(data => {
                setTags(data)
                setTagsLoading(false)
                setTagsLocked(false)
            })
        }
    }, [digestUrl])

    const handleSpecialTagClick = (tag, name) => event => {
        event.stopPropagation()
        setTagsLocked(true)
        if (tag) {
            deleteTag(digestUrl, tag.id).then(() => {
                setTags([...(tags.filter(t => t.id !== tag.id))])
                setTagsLocked(false)
            }).catch(() => {
                setTagsLocked(false)
            })
        } else {
            createTag(digestUrl, { tag: name, public: publicTagsList.includes(name) }).then(newTag => {
                setTags([...tags, newTag])
                setTagsLocked(false)
            }).catch(() => {
                setTagsLocked(false)
            })
        }
    }

    const handleTagAdd = (tag, publicTag = true) => {
        setTagsLocked(true)
        createTag(digestUrl, { tag, public: publicTagsList.includes(tag) || publicTag }).then(newTag => {
            setTags([...tags, newTag])
            setTagsLocked(false)
        }).catch(() => {
            setTagsLocked(false)
        })
    }

    const handleTagDelete = tag => {
        tag.isMutating = true
        setTags([...tags])
        setTagsLocked(true)
        deleteTag(digestUrl, tag.id).then(() => {
            setTags([...(tags.filter(t => t.id !== tag.id))])
            setTagsLocked(false)
        }).catch(() => {
            tag.isMutating = false
            setTags([...tags])
            setTagsLocked(false)
        })
    }

    const handleTagLockClick = tag => () => {
        tag.isMutating = true
        setTags([...tags])
        setTagsLocked(true)
        updateTag(digestUrl, tag.id, {public: !tag.public}).then(changedTag => {
            Object.assign(tag, {
                ...changedTag,
                isMutating: false,
            })
            setTags([...tags])
            setTagsLocked(false)
        }).catch(() => {
            tag.isMutating = false
            setTags([...tags])
            setTagsLocked(false)
        })
    }

    return (
        <DocumentContext.Provider value={{
            data, pathname, loading,
            ocrData, fullPage, printMode,
            collection, collectionBaseUrl,
            digest, digestUrl, urlIsSha, docRawUrl,
            tab, handleTabChange,
            subTab, handleSubTabChange,
            tags, tagsLocked, tagsLoading,
            handleSpecialTagClick, handleTagAdd,
            handleTagDelete, handleTagLockClick,
        }}>
            {children}
        </DocumentContext.Provider>
    )
}

export const useDocument = () => useContext(DocumentContext)
