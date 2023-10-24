import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { MouseEvent } from 'react'

import { createTag, deleteTag, tags as tagsAPI, updateTag } from '../backend/api'
import { TAGS_REFRESH_DELAYS } from '../constants/general'
import { publicTagsList } from '../constants/specialTags'

import { DocumentStore } from './DocumentStore'

export interface Tag {
    id: string
    key: string
    tag: string
    public: boolean
    user: string
    date_created?: string
    date_modified?: string
    date_indexed?: string
}

interface TagsRefreshQueue {
    cancel: () => void
    promise: Promise<void>
}

interface TagsError {
    status: string
    statusText: string
    url: string
}

export class TagsStore {
    tags: Tag[] = []

    tagsLocked = false

    tagsLoading = true

    tagsError?: TagsError

    tagsRefreshQueue: TagsRefreshQueue | undefined

    constructor(private readonly documentStore: DocumentStore) {
        makeAutoObservable(this)

        reaction(
            () => documentStore.digestUrl,
            (digestUrl) => {
                if (digestUrl) {
                    this.setTagsLoading(true)
                    this.setTagsLocked(true)
                    tagsAPI(digestUrl)
                        .then((data) => {
                            this.setTags(data)
                            this.setTagsLoading(false)
                            this.setTagsLocked(false)
                        })
                        .catch((res) => {
                            this.setTags([])
                            this.setTagsError({ status: res.status, statusText: res.statusText, url: res.url })
                        })
                        .finally(() => {
                            this.setTagsLoading(false)
                        })
                }
            },
        )
    }

    get digestUrl() {
        if (!this.documentStore.digestUrl) {
            throw new Error('Document with tags not loaded')
        }

        return this.documentStore.digestUrl
    }

    setTags = (tags: Tag[]) => {
        runInAction(() => {
            this.tags = tags
        })
    }

    setTagsLocked = (tagsLocked: boolean) => {
        runInAction(() => {
            this.tagsLocked = tagsLocked
        })
    }

    setTagsLoading = (tagsLoading: boolean) => {
        runInAction(() => {
            this.tagsLoading = tagsLoading
        })
    }

    setTagsError = (tagsError: TagsError) => {
        runInAction(() => {
            this.tagsError = tagsError
        })
    }

    setTagsRefreshQueue = (tagsRefreshQueue: TagsRefreshQueue | undefined) => {
        runInAction(() => {
            this.tagsRefreshQueue = tagsRefreshQueue
        })
    }

    periodicallyCheckIndexedTime = (digestUrl: string): TagsRefreshQueue => {
        let timeout: ReturnType<typeof setTimeout>,
            delayIndex = 0

        const promise = new Promise<void>((resolve, reject) => {
            const runDelayedQuery = (delay: number) => {
                timeout = setTimeout(() => {
                    tagsAPI(digestUrl).then((data) => {
                        if (data.every((tag: Tag) => !!tag.date_indexed)) {
                            resolve()
                        } else if (delayIndex < TAGS_REFRESH_DELAYS.length) {
                            runDelayedQuery(TAGS_REFRESH_DELAYS[delayIndex++])
                        } else {
                            reject()
                        }
                    })
                }, delay)
            }
            runDelayedQuery(TAGS_REFRESH_DELAYS[delayIndex++])
        })

        const cancel = () => clearTimeout(timeout)

        return { cancel, promise }
    }

    addTagToRefreshQueue = (digestUrl: string) => {
        if (this.tagsRefreshQueue) {
            this.tagsRefreshQueue.cancel()
        }
        this.setTagsRefreshQueue(this.periodicallyCheckIndexedTime(digestUrl))
    }

    handleSpecialTagClick = (tag: Tag | undefined, name: string) => (event: MouseEvent) => {
        event.stopPropagation()
        this.setTagsLocked(true)
        if (tag) {
            deleteTag(this.digestUrl, tag.id)
                .then(() => {
                    this.setTags([...this.tags.filter((t) => t.id !== tag.id)])
                    this.addTagToRefreshQueue(this.digestUrl)
                })
                .finally(() => {
                    this.setTagsLocked(false)
                })
        } else {
            createTag(this.digestUrl, { tag: name, public: publicTagsList.includes(name) })
                .then((newTag) => {
                    this.setTags([...this.tags, newTag])
                    this.addTagToRefreshQueue(this.digestUrl)
                })
                .finally(() => {
                    this.setTagsLocked(false)
                })
        }
    }

    handleTagAdd = (tag: string, publicTag = true) => {
        this.setTagsLocked(true)
        createTag(this.digestUrl, { tag, public: publicTagsList.includes(tag) || publicTag })
            .then((newTag) => {
                this.setTags([...this.tags, newTag])
                this.addTagToRefreshQueue(this.digestUrl)
            })
            .finally(() => {
                this.setTagsLocked(false)
            })
    }

    handleTagDelete = (tag: Tag) => {
        this.setTags([...this.tags])
        this.setTagsLocked(true)
        deleteTag(this.digestUrl, tag.id)
            .then(() => {
                this.setTags([...this.tags.filter((t) => t.id !== tag.id)])
                this.addTagToRefreshQueue(this.digestUrl)
            })
            .catch(() => {
                this.setTags([...this.tags])
            })
            .finally(() => {
                this.setTagsLocked(false)
            })
    }

    handleTagLockClick = (tag: Tag) => () => {
        this.setTags([...this.tags])
        this.setTagsLocked(true)
        updateTag(this.digestUrl, tag.id, { public: !tag.public })
            .then((changedTag) => {
                Object.assign(tag, { ...changedTag })
            })
            .finally(() => {
                this.setTags([...this.tags])
                this.setTagsLocked(false)
            })
    }
}
