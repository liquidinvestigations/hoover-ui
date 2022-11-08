import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { collectionUrl, documentViewUrl } from '../utils/utils'
import { RequestError } from '../Types'
import { createDownloadUrl, createPreviewUrl, createThumbnailSrcSet, doc as docAPI } from '../backend/api'
import { HashStateStore } from './HashStateStore'

export interface OcrData {
    tag: string
    text: string
}

export interface ChildDocument {
    id: string
    filename: string
    filetype: 'folder' | null
    content_type: string
    digest?: string
    file?: string
    size?: number
}

export interface DocumentContent {
    id: string
    filename: string
    filetype: string
    'has-pdf-preview': boolean
    'has-thumbnails': boolean
    'content-type': string
    'date-created': string
    date: string
    lang: string
    ocr: boolean
    ocrpdf: boolean
    md5: string
    sha1: string
    'sha1-256': string
    size: number
    skipped: boolean
    text: string
    ocrtext: Record<string, string>
    attachments: []
    entity: string[]
    'entity-type.location': string[]
    'entity-type.organization': string[]
    'entity-type.person': string[]
    path: string
    'path-parts': string[]
    'path-text': string
    tika: string[]
    'tika-key': string[]
    'translated-from': string[]
    'translated-to': string[]
    'word-count': number
}

export interface DocumentData {
    id: string
    digest?: string
    parent_id: string
    parent_children_page: number
    children: ChildDocument[]
    children_count: number
    children_has_next_page: boolean
    children_page: number
    children_page_count: number
    content: DocumentContent
    has_locations: boolean
    version: string
}

export class DocumentStore {
    id: string | undefined

    collection: string | undefined

    data: DocumentData | undefined

    error: RequestError | undefined

    pathname: string | undefined

    loading = true

    digest: string | undefined

    digestUrl: string | undefined

    docRawUrl: string | undefined

    docPreviewUrl: string | undefined

    thumbnailSrcSet: string | undefined

    urlIsSha = true

    ocrData: OcrData[] | undefined

    tab = 0

    subTab = 0

    hashStore

    constructor(hashStore: HashStateStore) {
        makeAutoObservable(this)

        this.hashStore = hashStore

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
        this.data = undefined
        this.error = undefined
        this.loading = true
        this.tab = this.hashStore.hashState.tab ? parseInt(this.hashStore.hashState.tab) : 0

        if (this.pathname && !this.pathname.includes('_file_') && !this.pathname.includes('_directory_')) {
            this.digestUrl = this.pathname
            this.urlIsSha = true
        }

        docAPI(this.pathname)
            .then(this.parseDocumentData)
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
        return collectionUrl(this.collection)
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

    handleTabChange = (_event: Event, tab: number) => {
        this.tab = tab
        this.hashStore.setHashState({ tab: tab.toString() }, false)
    }

    handleSubTabChange = (_event: Event, subTab: number) => {
        this.subTab = subTab
        this.hashStore.setHashState({ subTab: subTab.toString() }, false)
    }
}
