import { makeAutoObservable, reaction } from 'mobx'

import { DocumentStore } from '../DocumentStore'
import { HashStateStore } from '../HashStateStore'

interface SearchResult {
    occurrenceCount: number
    highlightedText: string
    currentHighlightIndex: number
}

export class TextSearchStore {
    content: string[] = []
    searchResults: SearchResult[] = []
    loading: boolean = false
    containerRef: React.Ref<any> = null
    totalOccurrenceCount: number = 0

    constructor(private readonly documentStore: DocumentStore, private readonly hashStore: HashStateStore) {
        makeAutoObservable(this)

        reaction(
            () => this.searchResults[this.documentStore.subTab]?.currentHighlightIndex,
            () => this.searchResults.length && this.generateHighlightedText()
        )
    }

    getTotalSearchResultsCount = () => {
        return this.searchResults.reduce((prev, curr) => prev + curr.occurrenceCount, 0)
    }

    getSearchResultsCount = () => {
        return this.searchResults[this.documentStore.subTab]?.occurrenceCount || 0
    }

    getCurrentHighlightIndex = () => {
        return this.searchResults[this.documentStore.subTab]?.currentHighlightIndex || 0
    }

    nextSearchResult = () => {
        const searchResult = this.searchResults[this.documentStore.subTab]
        searchResult.currentHighlightIndex = (searchResult.currentHighlightIndex + 1) % searchResult.occurrenceCount
    }

    previousSearchResult = () => {
        const searchResult = this.searchResults[this.documentStore.subTab]
        searchResult.currentHighlightIndex = (searchResult.currentHighlightIndex - 1 + searchResult.occurrenceCount) % searchResult.occurrenceCount
    }

    setContainerRef = (containerRef: any) => {
        this.containerRef = containerRef
    }

    scrollToHighlight = () => {
        const container = document.querySelector(`#subTab-${this.documentStore.subTab}`)
        if (!container) return

        const searchResult = this.searchResults[this.documentStore.subTab]
        const highlightId = `highlight-${searchResult?.currentHighlightIndex}`
        const activeSearchResult = container.querySelector(`#${highlightId}`)

        if (activeSearchResult) {
            const parentRect = container.getBoundingClientRect()
            const resultRect = activeSearchResult.getBoundingClientRect()
            const scrollOffset = resultRect.top - parentRect.top - parentRect.height / 2

            container.scrollTo({
                top: container.scrollTop + scrollOffset,
            })
        }
    }

    clearSearch = () => {
        this.searchResults = []
        this.loading = false
        this.totalOccurrenceCount = 0
    }

    search = (query: string) => {
        this.loading = true

        const content = []
        if (this.documentStore.data?.content) content.push(this.documentStore.data.content.text)
        if (this.documentStore.ocrData?.length) content.push(...this.documentStore.ocrData.map(({ text }) => text))

        try {
            const searchResults = content.map((content) => this.runSearch(query, content))
            this.searchResults = searchResults.filter((result) => result !== null) as SearchResult[]
            this.totalOccurrenceCount = this.searchResults.reduce((prev, { occurrenceCount }) => prev + occurrenceCount, 0)
        } catch (error) {
            console.error('An error occurred during text search:', error)
        } finally {
            this.loading = false
        }
    }

    runSearch = (query: string, content: string): SearchResult => {
        if (!query || !content) return { occurrenceCount: 0, currentHighlightIndex: 0, highlightedText: '' }
        const lowerCaseQuery = query.toLowerCase()
        const lowerCaseContent = content.toLowerCase()

        let occurrenceCount = 0
        let highlightedText = ''

        let startIndex = 0
        let currentIndex = lowerCaseContent.indexOf(lowerCaseQuery, startIndex)

        while (currentIndex !== -1) {
            highlightedText += content.slice(startIndex, currentIndex)
            highlightedText += `<mark ${!occurrenceCount ? 'class="active"' : ''} id='highlight-${occurrenceCount}'>${content.slice(
                currentIndex,
                currentIndex + query.length
            )}</mark>`
            occurrenceCount++

            startIndex = currentIndex + query.length
            currentIndex = lowerCaseContent.indexOf(lowerCaseQuery, startIndex)
        }

        highlightedText += content.slice(startIndex)

        const findIndex = parseInt(this.hashStore.hashState.findIndex || '0')

        const searchResult: SearchResult = {
            occurrenceCount,
            highlightedText,
            currentHighlightIndex: findIndex < occurrenceCount ? findIndex : occurrenceCount - 1,
        }

        return searchResult
    }

    generateHighlightedText = () => {
        const searchResult = this.searchResults[this.documentStore.subTab]
        if (searchResult) {
            let { highlightedText, occurrenceCount, currentHighlightIndex } = searchResult

            if (occurrenceCount > 0) {
                const activeHighlight = `id='highlight-${currentHighlightIndex}'`
                highlightedText = highlightedText.replace(new RegExp(' class="active"', 'g'), '')
                highlightedText = highlightedText.replace(new RegExp(activeHighlight, 'g'), `class="active" ${activeHighlight}`)
                this.searchResults[this.documentStore.subTab].highlightedText = highlightedText
            }
        }

        this.scrollToHighlight()
    }
}
