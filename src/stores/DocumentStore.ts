import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { ReactElement, SyntheticEvent } from 'react'

import { createDownloadUrl, createOcrUrl, createPreviewUrl, createThumbnailSrcSet, doc as docAPI, fetchPdfTextContent } from '../backend/api'
import { LocalDocumentData } from '../components/finder/Types'
import { parentLevels } from '../components/finder/utils'
import { reactIcons } from '../constants/icons'
import { DocumentData, OcrData, RequestError } from '../Types'
import { collectionUrl, documentViewUrl, getBasePath } from '../utils/utils'

import { DocumentSearchStore } from './DocumentSearchStore'
import { HashStateStore } from './HashStateStore'
import { MetaStore } from './MetaStore'

interface Tab {
    tag: string
    name: string
    icon: ReactElement
    content: string
}

interface PdfPageContent {
    pageNum: number
    text: string
}

interface PdfTextContent {
    [key: string]: PdfPageContent[]
}
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

    metaStore: MetaStore

    documentSearchStore: DocumentSearchStore

    tabs: Tab[] = []

    pdfTextContent: PdfTextContent = {}

    constructor(private readonly hashStore: HashStateStore) {
        this.metaStore = new MetaStore()
        this.documentSearchStore = new DocumentSearchStore(this)
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

    getPdfTextContent = async () => {
        const { docRawUrl, digestUrl, tabs } = this;
    
        if (!docRawUrl || !digestUrl || this.data?.content['content-type'] !== 'application/pdf') return;
    
        const urls = [docRawUrl];
    
        for (let index = 1; index < tabs.length; index++) {
            urls.push(createOcrUrl(digestUrl, tabs[index]?.tag));
        }
    
        try {
            const responses = await Promise.all(urls.map(url => fetchPdfTextContent(url))); 
    
            responses.forEach(async (response, index) => {
                try {
                    const { data } = await response.json();
                    this.pdfTextContent[tabs[index]?.tag] = data;
                } catch (error) {
                    console.error('Error while fetching Pdf text content: ', error);
                }
            });
        } catch (error) {
            console.error('Error while fetching Pdf text content responses: ', error);
        }
    }
    
    setTabs = () => {
        const tabs = []
        if (this.data?.content) {
            tabs.push({
                name: 'Extracted from file',
                icon: reactIcons.content,
                content: this.data.content.text,
            } as Tab)
        }
        if (this.ocrData) {
            tabs.push(
                ...this.ocrData.map(({ tag, text }) => ({
                    tag,
                    name: (tag.startsWith('translated_') ? '' : 'OCR ') + tag,
                    icon: reactIcons.ocr,
                    content: text,
                }))
            )
        }

        this.tabs = tabs
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
            .then((data) => {
                this.parseDocumentData(data)
                this.metaStore.updateData(data)
                this.setTabs()
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
                this.documentSearchStore.search()
                runInAction(() => {
                    this.loading = false
                })
            })
    }

    getDocumentHierarchy = async () => {
        if (this.pathname && this.data) {
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
        this.docRawUrl = createDownloadUrl(`${this.collectionBaseUrl}/${data.digest}`, data.content?.filename?.[0] ?? '')
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
        this.docRawUrl = createDownloadUrl(`${this.collectionBaseUrl}/${data.id}`, data.content?.filename?.[0] ?? '')
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
