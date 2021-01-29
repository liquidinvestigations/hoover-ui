import React, { createContext, useContext, useEffect, useState } from 'react'
import url from 'url'
import { collectionUrl, documentViewUrl } from '../../utils'
import { createDownloadUrl, createTag, deleteTag, doc as docAPI, tags as tagsAPI, updateTag } from '../../backend/api'
import { publicTagsList } from './specialTags'

const DocumentContext = createContext({})

export function DocumentProvider({ children, collection, id, path, fullPage, printMode, setHash }) {
    const [data, setData] = useState()
    const [pathname, setPathname] = useState()
    const [loading, setLoading] = useState(true)

    const [digest, setDigest] = useState()
    const [digestUrl, setDigestUrl] = useState()
    const [docRawUrl, setDocRawUrl] = useState()
    const [urlIsSha, setUrlIsSha] = useState(true)

    const collectionBaseUrl = collectionUrl(collection)

    useEffect(() => {
        if ((collection && id) || path) {
            setTab(0)
            const newPath = path || documentViewUrl({ _collection: collection, _id: id })
            setPathname(newPath)
            setLoading(true)
            docAPI(newPath).then(data => {
                if (data.id.startsWith('_')) {
                    if (data.id.startsWith('_file_')) {
                        setDigest(data.digest)
                        setDigestUrl([url.resolve(newPath, './'), data.digest].join('/'))
                        setDocRawUrl(createDownloadUrl(
                            `${collectionBaseUrl}${data.digest}`, data.content.filename
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
                    setDigestUrl(newPath)
                    setDocRawUrl(createDownloadUrl(
                        `${collectionBaseUrl}${data.id}`, data.content.filename
                    ))
                    setUrlIsSha(true)
                }
                setData(data)
            }).finally(() => {
                setLoading(false)
            })
        } else {
            setLoading(false)
        }
    }, [collection, id, path])

    const [tab, setTab] = useState(0)
    const handleTabChange = (event, newValue) => setTab(newValue)

    const ocrData = Object.keys(data?.content.ocrtext || {}).map((tag, index) => {
        return {tag: tag, text: data.content.ocrtext[tag]}
    })

    const [subTab, setSubTab] = useState(ocrData?.length ? 1 : 0)
    const handleSubTabChange = (event, newValue) => setSubTab(newValue)

    const [tags, setTags] = useState([])
    const [tagsLocked, setTagsLocked] = useState(false)
    const [tagsLoading, setTagsLoading] = useState(true)

    useEffect(() => {
        if (pathname) {
            setTagsLoading(true)
            setTagsLocked(true)
            tagsAPI(pathname).then(data => {
                setTags(data)
                setTagsLoading(false)
                setTagsLocked(false)
            })
        }
    }, [pathname])

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
            setInputValue('')
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
