import { makeAutoObservable, reaction } from 'mobx'

import { Semaphore } from '../../utils/semaphore'
import { DocumentSearchStore } from '../DocumentSearchStore'

interface SearchResult {
    occurrenceCount: number
    highlightedText: string
    currentHighlightIndex: number
}

export class TextSearchStore {
    content: string[] = []
    searchResults: SearchResult[] = []
    searchSemaphore: Semaphore
    loading: boolean = false
    subTab: number = 0
    containerRef: React.Ref<any> = null
    totalOccurrenceCount: number = 0

    constructor(documentSearchStore: DocumentSearchStore) {
        this.searchSemaphore = documentSearchStore.searchSemaphore
        makeAutoObservable(this)

        reaction(
            () => this.searchResults[this.subTab]?.currentHighlightIndex,
            () => this.searchResults.length && this.generateHighlightedText()
        )
    }

    getTotalSearchResultsCount = () => {
        return this.searchResults.reduce((prev, curr) => prev + curr.occurrenceCount, 0)
    }

    getSearchResultsCount = () => {
        return this.searchResults[this.subTab]?.occurrenceCount || 0
    }

    getCurrentHighlightIndex = () => {
        return this.searchResults[this.subTab]?.currentHighlightIndex || 0
    }

    setTextContent = (content: string[]) => {
        this.content = content
    }

    setSubTab = (subTab: number) => {
        this.subTab = subTab
    }

    nextSearchResult = () => {
        const searchResult = this.searchResults[this.subTab]
        searchResult.currentHighlightIndex = (searchResult.currentHighlightIndex + 1) % searchResult.occurrenceCount
    }

    previousSearchResult = () => {
        const searchResult = this.searchResults[this.subTab]
        searchResult.currentHighlightIndex = (searchResult.currentHighlightIndex - 1 + searchResult.occurrenceCount) % searchResult.occurrenceCount
    }

    setContainerRef = (containerRef: any) => {
        this.containerRef = containerRef
    }

    scrollToHighlight = () => {
        const container = document.querySelector(`#subTab-${this.subTab}`)
        if (!container) return

        const searchResult = this.searchResults[this.subTab]
        const highlightId = `highlight-${searchResult.currentHighlightIndex}`
        const activeSearchResult = container.querySelector(`#${highlightId}`)

        if (activeSearchResult) {
            const parentRect = container.getBoundingClientRect()
            const resultRect = activeSearchResult.getBoundingClientRect()
            const scrollOffset = resultRect.top - parentRect.top - parentRect.height / 2

            container.scrollTo({
                top: container.scrollTop + scrollOffset,
                behavior: 'smooth',
            })
        }
    }

    search = async (query: string) => {
        this.loading = true

        try {
            const searchPromises = this.content.map(async (content) => {
                await this.searchSemaphore.acquire()

                try {
                    return await this.runSearch(query, content)
                } catch (error) {
                    console.error('An error occurred during text search:', error)
                    return null
                } finally {
                    this.searchSemaphore.release()
                }
            })

            const results = await Promise.all(searchPromises)
            this.searchResults = results.filter((result) => result !== null) as SearchResult[]
            this.totalOccurrenceCount = this.searchResults.reduce((prev, { occurrenceCount }) => prev + occurrenceCount, 0)
        } catch (error) {
            console.error('An error occurred during text search:', error)
        } finally {
            this.loading = false
        }
    }

    runSearch = (query: string, content: string): Promise<SearchResult> => {
        return new Promise((resolve) => {
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

            const searchResult: SearchResult = {
                occurrenceCount,
                highlightedText,
                currentHighlightIndex: 0,
            }

            resolve(searchResult)
        })
    }

    generateHighlightedText = () => {
        const searchResult = this.searchResults[this.subTab]
        if (searchResult) {
            let { highlightedText, occurrenceCount, currentHighlightIndex } = searchResult

            if (occurrenceCount > 0) {
                const activeHighlight = `id='highlight-${currentHighlightIndex}'`
                highlightedText = highlightedText.replace(new RegExp(' class="active"', 'g'), '')
                highlightedText = highlightedText.replace(new RegExp(activeHighlight, 'g'), `class="active" ${activeHighlight}`)
                this.searchResults[this.subTab].highlightedText = highlightedText
            }
        }

        this.scrollToHighlight()
    }
}
