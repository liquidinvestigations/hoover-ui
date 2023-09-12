import debounce from 'lodash/debounce'
import { makeAutoObservable, reaction } from 'mobx'

import { DocumentStore } from './DocumentStore'
import { HashStateStore } from './HashStateStore'
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

    constructor(documentStore: DocumentStore, private readonly hashStore: HashStateStore) {
        this.pdfSearchStore = new PdfSearchStore(documentStore, this.hashStore)
        this.textSearchStore = new TextSearchStore(documentStore, this.hashStore)
        this.metaSearchStore = new MetaSearchStore(documentStore.metaStore, this.hashStore)
        this.activeSearch = this.pdfSearchStore
        makeAutoObservable(this)

        reaction(
            () => this.inputValue,
            () => this.inputValue && this.setQuery()
        )

        reaction(
            () => this.hashStore.hashState.findQuery,
            (findQuery) => {
                if (!findQuery) return
                this.inputValue = findQuery
                this.query = findQuery
            }
        )

        reaction(
            () => this.activeSearch.getCurrentHighlightIndex(),
            (currentHighlightIndex) => {
                this.hashStore.setHashState({ findIndex: currentHighlightIndex })
            }
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
        this.hashStore.setHashState({ fq: this.inputValue })
    }, 500)

    clearQuery = () => {
        this.query = ''
        this.hashStore.setHashState({ fq: undefined })
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
        this.hashStore.setHashState({ findIndex: undefined })
    }

    async search(): Promise<void> {
        if (this.query.length < 3) return
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
