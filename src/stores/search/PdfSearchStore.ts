import { makeAutoObservable } from 'mobx'
import { RefObject } from 'react'

import { DocumentSearchStore } from '../DocumentSearchStore'

export interface SearchResults {
    pageNum: number
    index: number
}

export class PdfSearchStore {
    pdfDocument: any
    searchResults: SearchResults[] = []
    loading: boolean = false
    currentHighlightIndex: number = 0

    constructor() {
        makeAutoObservable(this)
    }

    getSearchResultsCount = () => {
        return this.searchResults.length
    }

    getCurrentHighlightIndex = () => {
        return this.currentHighlightIndex
    }

    setDocument = (pdfDocument: any) => {
        this.pdfDocument = pdfDocument
    }

    nextSearchResult = () => {
        this.currentHighlightIndex = (this.currentHighlightIndex + 1) % this.searchResults.length
    }

    previousSearchResult = () => {
        this.currentHighlightIndex = (this.currentHighlightIndex - 1 + this.searchResults.length) % this.searchResults.length
    }

    scrollToHighlight = (containerRef: RefObject<HTMLDivElement>) => {
        if (!containerRef.current) return
        const activeSearchResult = containerRef.current.querySelector(`#highlight-${this.currentHighlightIndex}`)
        const parentContainer = activeSearchResult?.closest('.pdfViewer')?.parentElement

        if (activeSearchResult && parentContainer) {
            const parentRect = parentContainer.getBoundingClientRect()
            const resultRect = activeSearchResult.getBoundingClientRect()
            const scrollOffset = resultRect.top - parentRect.top - parentRect.height / 2

            parentContainer.scrollTo({
                top: parentContainer.scrollTop + scrollOffset,
                behavior: 'smooth',
            })
        }
    }

    search = async (query: string) => {
        if (!this.pdfDocument) return
        this.loading = true
        this.currentHighlightIndex = 0

        try {
            const results: SearchResults[] = []
            const numPages: number = this.pdfDocument?.numPages
            let index = 0

            const processPage = async (pageNum: number) => {
                const page = await this.pdfDocument.getPage(pageNum)
                const textContent = await page.getTextContent()
                const text = textContent.items
                    .map((item: any) => item.str)
                    .join('')
                    .toLowerCase()

                const matches: SearchResults[] = []
                let startIndex = 0

                while (startIndex !== -1) {
                    startIndex = text.indexOf(query.toLowerCase(), startIndex)
                    if (startIndex !== -1) {
                        const endIndex = startIndex + query.length
                        matches.push({ pageNum, index })
                        index++
                        startIndex = endIndex
                    }
                }
                return matches
            }

            for (let pageNum = 1; pageNum <= numPages; pageNum++) {
                const pageMatches = await processPage(pageNum)
                results.push(...pageMatches)
            }

            this.searchResults = results
        } catch (error) {
            console.error('An error occurred during PDF search:', error)
        } finally {
            this.loading = false
        }
    }
}
