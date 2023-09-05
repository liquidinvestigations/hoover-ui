import { makeAutoObservable } from 'mobx'
import { Response } from 'node-fetch'
import { AbortSignal } from 'node-fetch/externals'
import { RefObject } from 'react'

import { fetchWithHeaders, X_HOOVER_PDF_EXTRACT_TEXT, X_HOOVER_PDF_SPLIT_PAGE_RANGE, X_HOOVER_REQUEST_HANDLE_DURATION_MS } from '../../backend/api'
import { DocumentChunks, DocumentRecord, PdfTextEntry } from '../../Types'
import { DocumentStore } from '../DocumentStore'

export interface PdfSearchResult {
    pageNum: number
    index: number
}

export class PdfSearchStore {
    searchResults: DocumentRecord<PdfSearchResult> = {}
    currentHighlightIndex: number = 0
    loading: boolean = false
    loadingPercentage: number = 0
    private abortController?: AbortController

    constructor(private readonly documentStore: DocumentStore) {
        makeAutoObservable(this)
    }

    private getAbortSignal = (): AbortSignal => {
        if (this.abortController) {
            this.abortController.abort()
        }
        this.abortController = new AbortController()
        return this.abortController.signal as AbortSignal
    }

    getTotalSearchResultsCount = () => {
        return Object.values(this.searchResults).reduce(
            (total, chunkResults) => total + Object.values(chunkResults)?.reduce((count, results) => count + results?.length, 0),
            0
        )
    }

    getDocumentSearchResultsCount = (index: number) => {
        if (!this.searchResults[index]) return 0
        return Object.values(this.searchResults[index])?.reduce((count, results) => count + results?.length, 0)
    }

    getDocumentLoadingState = (index: number) => {
        const { pdfDocumentInfo } = this.documentStore
        if (!pdfDocumentInfo[index] || !this.searchResults[index]) return true
        const totalChunks = Object.values(pdfDocumentInfo[index])?.reduce((prev, { chunks }) => prev + chunks?.length, 0)
        const loadedChunks = Object.values(this.searchResults[index])?.reduce((prev, curr) => prev + Object.keys(curr)?.length, 0)

        return loadedChunks < totalChunks
    }

    getSearchResultsCount = () => {
        const { subTab, chunkTab, pdfDocumentInfo } = this.documentStore
        const { chunks } = pdfDocumentInfo[subTab]
        return this.searchResults[subTab]?.[chunks[chunkTab]]?.length || 0
    }

    getChunkSearchResultsCount = (chunk: string): number | undefined => {
        const { subTab } = this.documentStore
        return this.searchResults[subTab]?.[chunk]?.length
    }

    getCurrentHighlightIndex = () => {
        return this.currentHighlightIndex
    }

    nextSearchResult = () => {
        const { subTab, chunkTab, pdfDocumentInfo } = this.documentStore
        const { chunks } = pdfDocumentInfo[subTab]
        const chunkResults = this.searchResults[subTab]?.[chunks[chunkTab]]
        if (chunkResults) {
            this.currentHighlightIndex = (this.currentHighlightIndex + 1) % chunkResults.length
        }
    }

    previousSearchResult = () => {
        const { subTab, chunkTab, pdfDocumentInfo } = this.documentStore
        const { chunks } = pdfDocumentInfo[subTab]
        const chunkResults = this.searchResults[subTab]?.[chunks[chunkTab]]
        if (chunkResults) {
            this.currentHighlightIndex = (this.currentHighlightIndex - 1 + chunkResults.length) % chunkResults.length
        }
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
        this.currentHighlightIndex = 0
    }

    getEstimatedTimeLeft = () => {
        const { pdfDocumentInfo } = this.documentStore
        const totalChunks = Object.values(pdfDocumentInfo)?.reduce((prev, { chunks }) => prev + chunks?.length, 0)
        const loadedChunks = Object.values(this.searchResults)?.reduce((prev, curr) => prev + Object.keys(curr)?.length, 0)
        const averageLoadingTime = this.loadingPercentage / loadedChunks
        return averageLoadingTime * totalChunks - this.loadingPercentage
    }

    getLoadingPercentage = () => {
        const { pdfDocumentInfo } = this.documentStore
        const totalChunks = Object.values(pdfDocumentInfo)?.reduce((prev, { chunks }) => prev + chunks?.length, 0)
        const loadedChunks = Object.values(this.searchResults)?.reduce((prev, curr) => prev + Object.keys(curr)?.length, 0)
        return Math.floor((loadedChunks * 100) / totalChunks)
    }

    searchPdfTextContent = (pdfTextContent: PdfTextEntry[], query: string) => {
        const chunkResults: PdfSearchResult[] = []
        pdfTextContent.forEach(({ pageNum, text }) => {
            let startIndex = 0

            while (startIndex !== -1) {
                startIndex = text.indexOf(query.toLowerCase(), startIndex)
                if (startIndex !== -1) {
                    const endIndex = startIndex + query.length
                    chunkResults.push({ pageNum: parseInt(pageNum), index: chunkResults.length })
                    startIndex = endIndex
                }
            }
        })

        return chunkResults
    }

    setChunkResults = (documentIndex: number, chunkResults: DocumentChunks<PdfSearchResult>) => {
        this.searchResults = {
            ...this.searchResults,
            [documentIndex]: {
                ...this.searchResults[documentIndex],
                ...chunkResults,
            },
        }
    }

    getRequestLoadingTime = (response: Response) => {
        const loadingTime = response.headers.get(X_HOOVER_REQUEST_HANDLE_DURATION_MS) ?? '500'
        this.loadingPercentage += parseFloat(loadingTime)
        return Math.min(Math.max(0.5, parseFloat(loadingTime) / 1000), 30)
    }

    search = async (query: string) => {
        this.currentHighlightIndex = 0
        this.searchResults = {}
        const { pdfDocumentInfo } = this.documentStore
        let delay = 500
        this.loading = true

        try {
            const documentUrls = this.documentStore.getDocumentUrls()

            for (let i = 0; i < documentUrls.length; i++) {
                for (const chunk of pdfDocumentInfo[i]?.chunks || []) {
                    const queryParams = new URLSearchParams({
                        [X_HOOVER_PDF_SPLIT_PAGE_RANGE]: chunk,
                        [X_HOOVER_PDF_EXTRACT_TEXT]: '1',
                    })

                    const response = await fetchWithHeaders(`${documentUrls[i]}?${queryParams}`, {
                        signal: this.getAbortSignal(),
                        maxRetryCount: 1,
                    })

                    if (response.status === 200) {
                        delay = this.getRequestLoadingTime(response)

                        const pdfTextContent: PdfTextEntry[] = await response.json()
                        const chunkResults = this.searchPdfTextContent(pdfTextContent, query)

                        this.setChunkResults(i, { [chunk]: chunkResults })
                    } else {
                        this.setChunkResults(i, { [chunk]: [] })
                    }
                }
            }
        } catch (error) {
            console.error('An error occurred during PDF search: ', error)
        } finally {
            this.loading = false
        }
    }
}
