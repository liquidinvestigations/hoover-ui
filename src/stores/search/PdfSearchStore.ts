import { makeAutoObservable } from 'mobx'
import { AbortSignal } from 'node-fetch/externals'
import { RefObject } from 'react'

import { fetchWithHeaders, X_HOOVER_PDF_EXTRACT_TEXT, X_HOOVER_PDF_SPLIT_PAGE_RANGE } from '../../backend/api'
import { DocumentChunks, DocumentRecord, PdfTextEntry } from '../../Types'
import { DocumentStore } from '../DocumentStore'
import { HashStateStore } from '../HashStateStore'

export interface PdfSearchResult {
    pageNum: number
    index: number
}

export class PdfSearchStore {
    searchResults: DocumentRecord<PdfSearchResult> = {}
    currentHighlightIndex: number = 0
    loading: boolean = false
    loadingTime: number = 0
    estimatedTimeLeft: number = 0
    private abortController?: AbortController
    documentStore: DocumentStore

    constructor(
        documentStore: DocumentStore,
        private readonly hashStore: HashStateStore,
    ) {
        this.documentStore = documentStore
        makeAutoObservable(this)
    }

    private resetSearch = () => {
        this.searchResults = {}
        this.loadingTime = 0
    }

    private searchInDocument = async (query: string, documentUrl: string, documentIndex: number, signal: AbortSignal) => {
        for (const chunk of this.documentStore.pdfDocumentInfo?.chunks || []) {
            if (signal.aborted) return

            const chunkResults = await this.fetchAndSearchChunk(query, documentUrl, chunk, signal)
            this.setChunkResults(documentIndex, { [chunk]: chunkResults })
        }
    }

    private fetchAndSearchChunk = async (query: string, documentUrl: string, chunk: string, signal: AbortSignal): Promise<PdfSearchResult[]> => {
        const queryParams = this.buildQueryParams(chunk)
        const startTime = Date.now()
        const response = await fetchWithHeaders(`${documentUrl}?${queryParams}`, {
            signal,
            maxRetryCount: 1,
        })

        if (response.status === 200) {
            const endTime = Date.now()
            this.updateLoadingTime(endTime - startTime)
            const pdfTextContent: PdfTextEntry[] = await response.json()
            return this.searchPdfTextContent(pdfTextContent, query)
        }

        return []
    }

    private buildQueryParams = (chunk: string): string => {
        const queryParams = new URLSearchParams({
            [X_HOOVER_PDF_SPLIT_PAGE_RANGE]: chunk,
            [X_HOOVER_PDF_EXTRACT_TEXT]: '1',
        })
        return queryParams.toString()
    }

    private updateLoadingTime = (requestTime: number) => {
        this.loadingTime += requestTime
        this.setEstimatedTimeLeft(requestTime)
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
            0,
        )
    }

    getDocumentSearchResultsCount = (index: number) => {
        if (!this.searchResults[index]) return 0
        return Object.values(this.searchResults[index])?.reduce((count, results) => count + results?.length, 0)
    }

    getDocumentLoadingState = (index: number) => {
        const { pdfDocumentInfo } = this.documentStore
        if (!pdfDocumentInfo || !this.searchResults[index]) return true
        const totalChunks = this.getTotalChunks()
        const loadedChunks = this.getLoadedChunks()

        return loadedChunks < totalChunks
    }

    getSearchResultsCount = (): number => {
        const { subTab, chunkTab, pdfDocumentInfo } = this.documentStore
        const { chunks } = pdfDocumentInfo
        return this.searchResults[subTab]?.[chunks[chunkTab]]?.length || 0
    }

    getChunkSearchResultsCount = (chunk: string): number | undefined => {
        const { subTab } = this.documentStore
        return this.searchResults[subTab]?.[chunk]?.length
    }

    getCurrentHighlightIndex = (): number => {
        const searchResultsCount = this.getSearchResultsCount()
        if (searchResultsCount && this.currentHighlightIndex > searchResultsCount) this.currentHighlightIndex = searchResultsCount - 1
        return this.currentHighlightIndex
    }

    nextSearchResult = () => {
        const { subTab, chunkTab, pdfDocumentInfo } = this.documentStore
        const { chunks } = pdfDocumentInfo
        const chunkResults = this.searchResults[subTab]?.[chunks[chunkTab]]
        if (chunkResults) {
            this.currentHighlightIndex = (this.currentHighlightIndex + 1) % chunkResults.length
        }
    }

    previousSearchResult = () => {
        const { subTab, chunkTab, pdfDocumentInfo } = this.documentStore
        const { chunks } = pdfDocumentInfo
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
        this.abortController?.abort()
        this.searchResults = {}
        this.currentHighlightIndex = 0
    }

    getTotalChunks = () => this.documentStore.pdfDocumentInfo?.chunks?.length * this.documentStore.getDocumentUrls().length || 0

    getLoadedChunks = () => Object.values(this.searchResults)?.reduce((prev, curr) => prev + Object.keys(curr)?.length, 0)

    setEstimatedTimeLeft = (requestCompletionTime: number) => {
        const totalChunks = this.getTotalChunks()
        const loadedChunks = this.getLoadedChunks()
        this.estimatedTimeLeft = requestCompletionTime * (totalChunks - loadedChunks)
    }

    getLoadingPercentage = () => {
        const totalChunks = this.getTotalChunks()
        const loadedChunks = this.getLoadedChunks()
        return Math.floor((loadedChunks * 100) / totalChunks)
    }

    searchPdfTextContent = (pdfTextContent: PdfTextEntry[], query: string) => {
        const chunkResults: PdfSearchResult[] = []
        pdfTextContent.forEach(({ pageNum, text }) => {
            let startIndex = 0

            while (startIndex !== -1) {
                startIndex = text.toLowerCase().indexOf(query.toLowerCase(), startIndex)
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

    search = async (query: string) => {
        this.resetSearch()
        this.currentHighlightIndex = parseInt(this.hashStore.hashState.findIndex || '0')
        this.loading = true

        const signal = this.getAbortSignal()
        const documentUrls = this.documentStore.getDocumentUrls()

        for (let i = 0; i < documentUrls.length; i++) {
            await this.searchInDocument(query, documentUrls[i], i, signal)
        }

        this.loading = this.getLoadedChunks() === this.getTotalChunks()
    }
}
