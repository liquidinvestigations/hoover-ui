import { makeAutoObservable } from 'mobx'
import { RefObject } from 'react'

import { DocumentSearchStore } from '../DocumentSearchStore'

interface SearchResults {
    pageNum: number
    index: number
}

export class PdfSearchStore {
    pdfDocument: any
    searchResults: SearchResults[] = []
    loading: boolean = false
    currentHighlightIndex: number = 0

    constructor(documentSearchStore: DocumentSearchStore) {
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

        try {
            const results: SearchResults[] = []
            const numPages: number = this.pdfDocument?.numPages
            const chunkSize: number = 5
            let index = 0

            const processPage = async (pageNum: number) => {
                try {
                    const page = await this.pdfDocument.getPage(pageNum)
                    const textContent = await page.getTextContent()
                    const text = textContent.items
                        .map((item: any) => item.str)
                        .join('')
                        .toLowerCase()

                    const matches: SearchResults[] = []
                    let startIndex = 0

                    while (startIndex !== -1) {
                        startIndex = text.indexOf(query, startIndex)
                        if (startIndex !== -1) {
                            const endIndex = startIndex + query.length
                            matches.push({ pageNum, index })
                            index++
                            startIndex = endIndex
                        }
                    }

                    return matches
                } catch (error) {
                    console.error('An error occurred during PDF page processing:', error)
                    throw error 
                }
            }

            const processChunk = async (start: number, end: number) => {
                const promises: Promise<SearchResults[]>[] = []
                for (let j = start; j < end; j++) {
                    promises.push(processPage(j + 1))
                }

                const chunkResults = await Promise.allSettled(promises)
                chunkResults.forEach((result) => {
                    if (result.status === 'fulfilled') {
                        results.push(...result.value)
                    } else {
                        console.error('An error occurred during PDF search:', result.reason)
                    }
                })
            }

            const totalPages = Math.ceil(numPages / chunkSize)

            for (let i = 0; i < totalPages; i++) {
                const startIndex = i * chunkSize
                const endIndex = startIndex + chunkSize

                await processChunk(startIndex, endIndex)
            }

            this.searchResults = results
        } catch (error) {
            console.error('An error occurred during PDF search:', error)
        } finally {
            this.loading = false
        }
    }
}
