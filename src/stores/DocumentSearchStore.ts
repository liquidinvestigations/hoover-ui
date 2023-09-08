import debounce from 'lodash/debounce'
import { makeAutoObservable, reaction } from 'mobx'

import { DocumentStore } from './DocumentStore'
import { MetaSearchStore } from './search/MetaSearchStore'
import { PdfSearchStore } from './search/PdfSearchStore'
import { TextSearchStore } from './search/TextSearchStore'

export class DocumentSearchStore {
    inputValue: string = ''
    query: string = ''
    loading: boolean = false
    pdfSearchStore: PdfSearchStore
    textSearchStore: TextSearchStore
    metaSearchStore: MetaSearchStore
    activeSearch: PdfSearchStore | TextSearchStore | MetaSearchStore
    documentStore: DocumentStore

    constructor(documentStore: DocumentStore) {
        this.documentStore = documentStore
        this.pdfSearchStore = new PdfSearchStore(documentStore)
        this.textSearchStore = new TextSearchStore(this)
        this.metaSearchStore = new MetaSearchStore(documentStore.metaStore)
        this.activeSearch = this.pdfSearchStore
        makeAutoObservable(this)

        reaction(
            () => this.inputValue,
            () => this.inputValue && this.setQuery()
        )

        reaction(
            () => this.query,
            () => {
                if (!this.query || this.query.length < 3) {
                    this.clearSearch()
                } else {
                    this.search()
                }
            }
        )
    }

    setQuery = debounce(() => {
        this.query = this.inputValue
    }, 500)

    clearQuery = () => {
        this.query = ''
    }

    setInputValue = (value: string) => {
        this.inputValue = value
    }

    setActiveSearch = (activeSearch: PdfSearchStore | TextSearchStore | MetaSearchStore) => {
        this.activeSearch = activeSearch
    }

    clearSearch = () => {
        this.pdfSearchStore.clearSearch()
        this.textSearchStore.clearSearch()
        this.metaSearchStore.clearSearch()
    }

    async search(): Promise<void> {
        this.loading = true

        const promises = [this.pdfSearchStore.search(this.query), this.textSearchStore.search(this.query), this.metaSearchStore.search(this.query)]

        try {
            await Promise.all(promises)
        } catch (error) {
            console.error('An error occurred during search:', error)
        } finally {
            this.loading = false
        }
    }
}
