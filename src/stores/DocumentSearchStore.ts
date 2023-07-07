import debounce from 'lodash/debounce'
import { makeAutoObservable, reaction } from 'mobx'

import { Semaphore } from '../utils/semaphore'

import { DocumentStore } from './DocumentStore'
import { MetaSearchStore } from './search/MetaSearchStore'
import { PdfSearchStore } from './search/PdfSearchStore'
import { TextSearchStore } from './search/TextSearchStore'

export class DocumentSearchStore {
    isOpen: boolean = false
    query: string = ''
    loading: boolean = false
    pdfSearchStore: PdfSearchStore
    textSearchStore: TextSearchStore
    metaSearchStore: MetaSearchStore
    searchSemaphore: Semaphore
    activeSearch: PdfSearchStore | TextSearchStore | MetaSearchStore
    documentStore: DocumentStore;

    constructor(documentStore: DocumentStore) {
        this.documentStore = documentStore
        this.searchSemaphore = new Semaphore(4)
        this.pdfSearchStore = new PdfSearchStore(this)
        this.textSearchStore = new TextSearchStore(this)
        this.metaSearchStore = new MetaSearchStore(this, documentStore.metaStore)
        this.activeSearch = this.pdfSearchStore
        makeAutoObservable(this)

        reaction(
            () => this.query,
            () => this.query && this.search()
        )
    }

    setQuery = debounce((value: string): void => {
        this.query = value
    }, 500)

    toggleSearchInput = () => {
        this.isOpen = !this.isOpen
    } 

    setLoading(value: boolean) {
        this.loading = value
    }

    setActiveSearch = (activeSearch: PdfSearchStore | TextSearchStore | MetaSearchStore) => {
        this.activeSearch = activeSearch
    }

    async search(): Promise<void> {
        this.loading = true

        const promises = [this.textSearchStore.search(this.query), this.metaSearchStore.search(this.query)]
        // For now, we can only search in the PDF when the viewer is active. Will be handled in a separate ticket
        if (this.activeSearch instanceof PdfSearchStore) promises.push(this.pdfSearchStore.search(this.query))

        try {
            await Promise.all(promises)
        } catch (error) {
            console.error('An error occurred during search:', error)
        } finally {
            this.loading = false
        }
    }
}
