import { makeAutoObservable, reaction } from 'mobx'

import { MetaData, MetaStore, TableData } from '../MetaStore'

export class MetaSearchStore {
    searchResults: number = 0
    currentHighlightIndex: number = 0
    loading = false
    metaStore: MetaStore
    highlightedMetaData: MetaData[] = []
    highlightedTableData: TableData[] = []

    constructor(metaStore: MetaStore) {
        this.metaStore = metaStore
        makeAutoObservable(this)

        reaction(
            () => this.currentHighlightIndex,
            () => {
                const highlightId = `"highlight-${this.currentHighlightIndex}"`
                const activeClass = ' class="active"'

                const tableDataEntryWithActiveClass = this.highlightedTableData.find((entry) => String(entry.display).includes(activeClass))
                if (tableDataEntryWithActiveClass) {
                    tableDataEntryWithActiveClass.display = tableDataEntryWithActiveClass.display.replace(activeClass, '')
                }

                this.highlightedMetaData.forEach((entry) => {
                    if (Array.isArray(entry.value)) {
                        entry.value = entry.value.map((item) => (item as string).replace(activeClass, ''))
                    } else {
                        entry.value = String(entry.value).replace(activeClass, '')
                    }
                })

                const tableDataEntryWithHighlightId = this.highlightedTableData.find((entry) => String(entry.display).includes(highlightId))
                if (tableDataEntryWithHighlightId) {
                    tableDataEntryWithHighlightId.display = tableDataEntryWithHighlightId.display.replace(
                        highlightId,
                        (match: string) => `${match} ${activeClass}`
                    )
                }

                this.highlightedMetaData.forEach((entry) => {
                    if (Array.isArray(entry.value)) {
                        entry.value = entry.value.map((item) => (item as string).replace(highlightId, (match: string) => `${match} ${activeClass}`))
                    } else {
                        entry.value = String(entry.value).replace(highlightId, (match: string) => `${match} ${activeClass}`)
                    }
                })

                this.scrollToHighlight()
            }
        )
    }

    scrollToHighlight = () => {
        const container = document.querySelector('.activeTab')
        if (!container) return

        const activeSearchResult = container.querySelector(`#highlight-${this.currentHighlightIndex}`)

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

    getSearchResultsCount = () => {
        return this.searchResults
    }

    getCurrentHighlightIndex = () => {
        return this.currentHighlightIndex
    }

    nextSearchResult = () => {
        this.currentHighlightIndex = (this.currentHighlightIndex + 1) % this.searchResults
    }

    previousSearchResult = () => {
        this.currentHighlightIndex = (this.currentHighlightIndex - 1 + this.searchResults) % this.searchResults
    }

    clearSearch = () => {
        this.searchResults = 0
        this.loading = false
        this.currentHighlightIndex = 0
        this.highlightedMetaData = []
        this.highlightedTableData = []
    }

    search = async (query: string) => {
        this.searchResults = 0
        this.loading = true

        const escapeRegExp = (string: string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special characters
        }

        const highlightElement = (element: string) => {
            return String(element)?.replace(new RegExp(escapeRegExp(query), 'gi'), (match) => {
                const matched = `<mark id="highlight-${this.searchResults}" ${
                    this.currentHighlightIndex === this.searchResults ? `class="active"` : ''
                }>${match}</mark>`
                this.searchResults++
                return matched
            })
        }

        try {
            const highlightedTableData: TableData[] = this.metaStore.tableData.map((entry: TableData) => {
                const { field, label, display, searchKey, searchTerm } = entry

                if (String(display).toLowerCase().includes(query.toLowerCase())) {
                    const highlightedDisplay =  highlightElement(display)
                    return { field, label, display: highlightedDisplay, searchKey, searchTerm }
                }

                return entry
            })

            const highlightedMetaData: MetaData[] = this.metaStore.metaData.map((entry: MetaData) => {
                const { key, value, componentKey } = entry

                if (Array.isArray(value)) {
                    const highlightedValueArray = value.map((item) => {
                        if (String(item).toLowerCase().includes(query.toLowerCase())) {
                            const highlightedItem = highlightElement(item)
                            return highlightedItem
                        }
                        return item
                    })

                    return { key, value: highlightedValueArray, componentKey }
                }

                if (String(value).toLowerCase().includes(query.toLowerCase())) {
                    const highlightedValue = highlightElement(value)
                    return { key, value: highlightedValue, componentKey }
                }

                return entry
            })

            this.highlightedMetaData = highlightedMetaData
            this.highlightedTableData = highlightedTableData
        } catch (error) {
            console.error('An error occurred during search:', error)
        } finally {
            this.currentHighlightIndex = 0
            this.loading = false
        }
    }
}
