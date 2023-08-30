import { makeAutoObservable } from 'mobx'
import { RefObject } from 'react'

import { DocumentStore } from '../DocumentStore'

export interface SearchResults {
    [key: string]: PdfSearchResult[]
}

export interface PdfSearchResult {
    pageNum: number
    index: number
}

export class PdfSearchStore {
    searchResults: SearchResults = {}
    loading: boolean = false
    currentHighlightIndex: number = 0
    documentStore: DocumentStore

    constructor(documentStore: DocumentStore) {
        this.documentStore = documentStore
        makeAutoObservable(this)
    }

    getTotalSearchResultsCount = () => {
        return Object.keys(this.searchResults).reduce((prev, curr) => (prev + this.searchResults[curr].length), 0)
    }

    getSearchResultsCount = () => {
        const { tabs, subTab } = this.documentStore
        return this.searchResults[tabs[subTab].tag]?.length || 0
    }

    getCurrentHighlightIndex = () => {
        return this.currentHighlightIndex
    }

    nextSearchResult = () => {
        const { tabs, subTab } = this.documentStore
        this.currentHighlightIndex = (this.currentHighlightIndex + 1) % this.searchResults[tabs[subTab].tag].length
    }

    previousSearchResult = () => {
        const { tabs, subTab } = this.documentStore
        this.currentHighlightIndex =
            (this.currentHighlightIndex - 1 + this.searchResults[tabs[subTab].tag].length) % this.searchResults[tabs[subTab].tag].length
    }

    scrollToHighlight = (containerRef: RefObject<HTMLDivElement>) => {
        if (!containerRef.current) return
        const parentContainer = containerRef.current?.closest('.pdfViewer')
        
        if (!parentContainer) return
        const activeSearchResult = parentContainer.querySelector(`#highlight-${this.currentHighlightIndex}`)

        if (activeSearchResult && parentContainer) {
            const parentRect = parentContainer.getBoundingClientRect()
            const resultRect = activeSearchResult.getBoundingClientRect()
            const scrollOffset = resultRect.top - parentRect.top - parentRect.height / 2

            parentContainer.scrollTo({
                top: parentContainer.scrollTop + scrollOffset,
            })
        }
    }

    clearSearch = () => {
        this.searchResults = {}
        this.loading = false
        this.currentHighlightIndex = 0
    }

    search = async (query: string) => {
        this.loading = true
        this.currentHighlightIndex = 0
        const { pdfTextContent } = this.documentStore
        try {
            const results: SearchResults = {}

            /* Object.keys(pdfTextContent).forEach((key) => {
                let index = 0
                results[key] = new Array()

                pdfTextContent[key].forEach(({ pageNum, text }) => {
                    let startIndex = 0

                    while (startIndex !== -1) {
                        startIndex = text.indexOf(query.toLowerCase(), startIndex)
                        if (startIndex !== -1) {
                            const endIndex = startIndex + query.length
                            results[key].push({ pageNum, index })
                            index++
                            startIndex = endIndex
                        }
                    }
                })
            }) */

            this.searchResults = results
        } catch (error) {
            console.error('An error occurred during PDF search:', error)
        } finally {
            this.loading = false
        }
    }
}
