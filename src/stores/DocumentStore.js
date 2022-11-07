import { autorun, makeAutoObservable, reaction, runInAction } from "mobx"
import { collectionUrl, documentViewUrl } from "../utils"
import { createDownloadUrl, createPreviewUrl, createThumbnailSrcSet, doc as docAPI } from "../backend/api"

export class DocumentStore {
    id = null

    collection = null

    data = null

    error = null

    pathname = null

    loading = true

    digest = null

    digestUrl = null

    docRawUrl = null

    docPreviewUrl = null

    thumbnailSrcSet = null

    urlIsSha = true

    ocrData = null

    tab = 0

    subTab = 0

    hashStore

    constructor (hashStore) {
        makeAutoObservable(this)

        this.hashStore = hashStore

        const hashState = this.hashStore.hashState
        if (hashState.preview) {
            runInAction(() => {
                this.setDocument(hashState.preview.c, hashState.preview.i)
                this.loadDocument()
            })
        }

        reaction(
            () => this.pathname,
            this.loadDocument
        )

        reaction(
            () => this.hashStore.hashState?.preview?.c && this.hashStore.hashState?.preview?.i,
            () => {
                this.setDocument(this.hashStore.hashState.preview.c, this.hashStore.hashState.preview.i)
            }
        )

        reaction(
            () => this.hashStore.hashState.tab,
            (tab => tab && (this.tab = parseInt(tab)))
        )

        reaction(
            () => this.hashStore.hashState.subTab,
            (subTab => subTab && (this.subTab = parseInt(subTab)))
        )
    }

    setDocument = (collection, id) => {
        this.collection = collection
        this.id = id
        this.pathname = documentViewUrl({ _collection: collection, _id: id })
    }

    loadDocument = () => {
        this.data = null
        this.error = null
        this.loading = true
        this.tab = parseInt(this.hashStore.hashState.tab) || 0

        if (!this.pathname.includes('_file_') && !this.pathname.includes('_directory_')) {
            this.digestUrl = this.pathname
            this.urlIsSha = true
        }

        docAPI(this.pathname)
            .then(this.parseDocumentData)
            .catch(res => {
                runInAction(() => {
                    this.error = { status: res.status, statusText: res.statusText, url: res.url }
                })
            })
            .finally(() => {
                runInAction(() => {
                    this.loading = false
                })
            })
    }

    parseDocumentData = data => {
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
            return {tag: tag, text: data.content.ocrtext[tag]}
        })
        this.ocrData = ocr

        const subTabState = parseInt(this.hashStore.hashState?.subTab)
        if (!isNaN(subTabState)) {
            this.subTab = subTabState
        } else {
            if (!data.content.text?.length && ocr.length) {
                this.subTab = 1
            } else {
                this.subTab = 0
            }
        }
    }

    get collectionBaseUrl() {
        return collectionUrl(this.collection)
    }

    setFileDocumentAttributes = data => {
        this.digest = data.digest
        this.digestUrl = `${this.collectionBaseUrl}/${data.digest}`
        this.docRawUrl = createDownloadUrl(
            `${this.collectionBaseUrl}/${data.digest}`, data.content.filename
        )
        this.docPreviewUrl = createPreviewUrl(`${this.collectionBaseUrl}/${data.digest}`)
        this.thumbnailSrcSet = createThumbnailSrcSet(`${this.collectionBaseUrl}/${data.digest}`)
        this.urlIsSha = false
    }

    setDirectoryDocumentAttributes = () => {
        this.digest = null
        this.docRawUrl = null
        this.docPreviewUrl = null
        this.thumbnailSrcSet = null
        this.urlIsSha = false
    }

    setShaDocumentAttributes = data => {
        this.digest = data.id
        this.docRawUrl = createDownloadUrl(
            `${this.collectionBaseUrl}/${data.id}`, data.content.filename
        )
        this.docPreviewUrl = createPreviewUrl(`${this.collectionBaseUrl}/${data.id}`)
        this.thumbnailSrcSet = createThumbnailSrcSet(`${this.collectionBaseUrl}/${data.id}`)
    }

    handleTabChange = (_event, tab) => {
        this.tab = tab
        this.hashStore.setHashState({ tab }, false)
    }

    handleSubTabChange = (_event, subTab) => {
        this.subTab = subTab
        this.hashStore.setHashState({ subTab }, false)
    }
}
