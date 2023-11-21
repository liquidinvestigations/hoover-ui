import { DEFAULT_MAX_RESULTS } from '../../../../constants/general'
import { Result } from '../../../../stores/search/SearchResultsStore'
import { CollectionData } from '../../../../Types'
import { numberArray } from '../../../../utils/utils'

const MAX_PREV_PAGES = 3
const MAX_NEXT_PAGES = 3
export const getMaxCount = (collectionsData: CollectionData[]): number => {
    const maxResultWindow = Math.max(...collectionsData.map((collectionData) => collectionData.max_result_window))
    return maxResultWindow && !isNaN(maxResultWindow) && maxResultWindow < DEFAULT_MAX_RESULTS ? maxResultWindow : DEFAULT_MAX_RESULTS
}

export const getTotalResults = (results: Result[]): number => {
    return Math.max(...results.map(({ hits }) => hits?.total || 0), 0)
}

export const getPageCount = (total: number, maxCount: number, size: number): number => {
    return Math.ceil(Math.min(total, maxCount) / size)
}

export const getPages = (currentPage: number, pageCount: number): Record<string, number[]> => {
    const pages: Record<string, number[]> = { left: [], middle: [], right: [] }

    if (pageCount <= MAX_PREV_PAGES + MAX_NEXT_PAGES + 1) {
        pages.middle.push(...numberArray(1, Math.min(MAX_PREV_PAGES + MAX_NEXT_PAGES + 1, pageCount)))
    } else if (currentPage - 1 <= MAX_PREV_PAGES) {
        pages.left.push(...numberArray(1, MAX_PREV_PAGES + MAX_NEXT_PAGES + 1))
        pages.right.push(pageCount)
    } else if (currentPage + MAX_NEXT_PAGES + 1 <= pageCount) {
        pages.left.push(1)
        pages.middle.push(...numberArray(currentPage - MAX_PREV_PAGES, MAX_PREV_PAGES + MAX_NEXT_PAGES + 1))
        pages.right.push(pageCount)
    } else {
        pages.left.push(1)
        pages.right.push(...numberArray(currentPage - MAX_PREV_PAGES, MAX_PREV_PAGES + pageCount - currentPage + 1))
    }

    return pages
}
