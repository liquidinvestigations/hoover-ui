import React, { createContext, useContext, useEffect, useState } from 'react'
import { useSearch } from '../search/SearchProvider'
import { publicTagsList } from '../../constants/specialTags'
import { createTag, deleteTag, tags as tagsAPI, updateTag } from '../../backend/api'
import { useSharedStore } from "../SharedStoreProvider"

const TagsContext = createContext({})

    export function TagsProvider({children}) {
    const { addTagToRefreshQueue } = useSearch()
    const { digestUrl } = useSharedStore().documentStore

    const [tags, setTags] = useState([])
    const [tagsLocked, setTagsLocked] = useState(false)
    const [tagsLoading, setTagsLoading] = useState(true)
    const [tagsError, setTagsError] = useState(null)

    useEffect(() => {
        if (digestUrl) {
            setTagsLoading(true)
            setTagsLocked(true)
            setTagsError(null)
            tagsAPI(digestUrl).then(data => {
                setTags(data)
                setTagsLoading(false)
                setTagsLocked(false)
            }).catch(res => {
                setTags([])
                setTagsError({ status: res.status, statusText: res.statusText, url: res.url })
            }).finally(() => {
                setTagsLoading(false)
            })
        }
    }, [digestUrl])

    const handleSpecialTagClick = (tag, name) => event => {
        event.stopPropagation()
        setTagsLocked(true)
        if (tag) {
            deleteTag(digestUrl, tag.id).then(() => {
                setTags([...(tags.filter(t => t.id !== tag.id))])
                if (addTagToRefreshQueue) {
                    addTagToRefreshQueue(digestUrl)
                }
            }).finally(() => {
                setTagsLocked(false)
            })
        } else {
            createTag(digestUrl, { tag: name, public: publicTagsList.includes(name) }).then(newTag => {
                setTags([...tags, newTag])
                if (addTagToRefreshQueue) {
                    addTagToRefreshQueue(digestUrl)
                }
            }).finally(() => {
                setTagsLocked(false)
            })
        }
    }

    const handleTagAdd = (tag, publicTag = true) => {
        setTagsLocked(true)
        createTag(digestUrl, { tag, public: publicTagsList.includes(tag) || publicTag }).then(newTag => {
            setTags([...tags, newTag])
            if (addTagToRefreshQueue) {
                addTagToRefreshQueue(digestUrl)
            }
        }).finally(() => {
            setTagsLocked(false)
        })
    }

    const handleTagDelete = tag => {
        setTags([...tags])
        setTagsLocked(true)
        deleteTag(digestUrl, tag.id).then(() => {
            setTags([...(tags.filter(t => t.id !== tag.id))])
            if (addTagToRefreshQueue) {
                addTagToRefreshQueue(digestUrl)
            }
        }).catch(() => {
            setTags([...tags])
        }).finally(() => {
            setTagsLocked(false)
        })
    }

    const handleTagLockClick = tag => () => {
        setTags([...tags])
        setTagsLocked(true)
        updateTag(digestUrl, tag.id, {public: !tag.public}).then(changedTag => {
            Object.assign(tag, { ...changedTag })
        }).finally(() => {
            setTags([...tags])
            setTagsLocked(false)
        })
    }

    return (
        <TagsContext.Provider value={{
            tags, tagsLocked, tagsLoading, tagsError,
            handleSpecialTagClick, handleTagAdd,
            handleTagDelete, handleTagLockClick,
        }}>
            {children}
        </TagsContext.Provider>
    )
}

export const useTags = () => useContext(TagsContext)
