import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { SyntheticEvent } from 'react'

import { createDownloadUrl, createPreviewUrl, createThumbnailSrcSet, doc as docAPI } from '../backend/api'
import { LocalDocumentData } from '../components/finder/Types'
import { DocumentData, OcrData, RequestError } from '../Types'
import { collectionUrl, documentViewUrl, getBasePath } from '../utils/utils'

import { HashStateStore } from './HashStateStore'

export class DocumentStore {
    id: string | undefined

    collection: string | undefined

    data: DocumentData | undefined

    error: RequestError | undefined

    pathname: string | undefined

    loading = false

    digest: string | undefined

    digestUrl: string | undefined

    docRawUrl: string | undefined

    docPreviewUrl: string | undefined

    thumbnailSrcSet: string | undefined

    urlIsSha = true

    ocrData: OcrData[] | undefined

    tab = 0

    subTab = 0

    hierarchy: LocalDocumentData | undefined = undefined

    constructor(private readonly hashStore: HashStateStore) {
        makeAutoObservable(this)

        runInAction(() => {
            const hashState = this.hashStore.hashState
            if (hashState.preview) {
                this.setDocument(hashState.preview.c, hashState.preview.i)
                this.loadDocument()
            }
        })

        reaction(() => this.pathname, this.loadDocument)

        reaction(
            () => this.hashStore.hashState.preview?.c && this.hashStore.hashState.preview?.i,
            () => {
                if (this.hashStore.hashState.preview?.c && this.hashStore.hashState.preview?.i) {
                    this.setDocument(this.hashStore.hashState.preview.c, this.hashStore.hashState.preview.i)
                }
            }
        )

        reaction(
            () => this.hashStore.hashState.tab,
            (tab) => tab && (this.tab = parseInt(tab))
        )

        reaction(
            () => this.hashStore.hashState.subTab,
            (subTab) => subTab && (this.subTab = parseInt(subTab))
        )
    }

    setDocument = (collection: string, id: string) => {
        this.collection = collection
        this.id = id
        this.pathname = documentViewUrl({ _collection: collection, _id: id })
    }

    loadDocument = () => {
        this.error = undefined
        this.loading = true
        this.tab = parseInt(this.hashStore.hashState.tab || '0')

        if (this.pathname && !this.pathname.includes('_file_') && !this.pathname.includes('_directory_')) {
            this.digestUrl = this.pathname
            this.urlIsSha = true
        }

        docAPI(this.pathname)
            .then((data: DocumentData) => {
                this.parseDocumentData(data)
                this.getDocumentHierarchy()
            })
            .catch((response: Response) => {
                runInAction(() => {
                    this.error = {
                        status: response.status,
                        statusText: response.statusText,
                        url: response.url,
                    }
                })
            })
            .finally(() => {
                runInAction(() => {
                    this.loading = false
                })
            })
    }

    getDocumentHierarchy = async () => {
        if (this.pathname && this.data) {
            const parentLevels = 3
            const localData = { ...this.data }
            let current: LocalDocumentData | undefined = localData
            let level = 0

            while (current?.parent_id && level < parentLevels) {
                current.parent = await docAPI(getBasePath(this.pathname) + current.parent_id, current.parent_children_page)

                current = current.parent
                level++
            }

            this.hierarchy = localData
        }
    }

    parseDocumentData = (data: DocumentData) => {
        if (data.id.startsWith('_')) {
            if (data.id.startsWith('_file_')) {
                this.setFileDocumentAttributes(data)
            } else if (data.id.startsWith('_directory_')) {
                this.setDirectoryDocumentAttributes()
            }
        } else {
            this.setShaDocumentAttributes(data)
        }
        this.data = data

        const ocr = Object.keys(data.content.ocrtext || {}).map((tag) => {
            return { tag: tag, text: data.content.ocrtext[tag] }
        })
        this.ocrData = ocr

        if (this.hashStore.hashState.subTab) {
            this.subTab = parseInt(this.hashStore.hashState.subTab)
        } else {
            if (!data.content.text?.length && ocr.length) {
                this.subTab = 1
            } else {
                this.subTab = 0
            }
        }
    }

    get collectionBaseUrl() {
        if (this.collection) {
            return collectionUrl(this.collection)
        }
    }

    setFileDocumentAttributes = (data: DocumentData) => {
        this.digest = data.digest
        this.digestUrl = `${this.collectionBaseUrl}/${data.digest}`
        this.docRawUrl = createDownloadUrl(`${this.collectionBaseUrl}/${data.digest}`, data.content.filename)
        this.docPreviewUrl = createPreviewUrl(`${this.collectionBaseUrl}/${data.digest}`)
        this.thumbnailSrcSet = createThumbnailSrcSet(`${this.collectionBaseUrl}/${data.digest}`)
        this.urlIsSha = false
    }

    setDirectoryDocumentAttributes = () => {
        this.digest = undefined
        this.docRawUrl = undefined
        this.docPreviewUrl = undefined
        this.thumbnailSrcSet = undefined
        this.urlIsSha = false
    }

    setShaDocumentAttributes = (data: DocumentData) => {
        this.digest = data.id
        this.docRawUrl = createDownloadUrl(`${this.collectionBaseUrl}/${data.id}`, data.content.filename)
        this.docPreviewUrl = createPreviewUrl(`${this.collectionBaseUrl}/${data.id}`)
        this.thumbnailSrcSet = createThumbnailSrcSet(`${this.collectionBaseUrl}/${data.id}`)
    }

    handleTabChange = (_event: SyntheticEvent, tab: number) => {
        this.tab = tab
        this.hashStore.setHashState({ tab: tab.toString() }, false)
    }

    handleSubTabChange = (_event: SyntheticEvent, subTab: number) => {
        this.subTab = subTab
        this.hashStore.setHashState({ subTab: subTab.toString() }, false)
    }
}
