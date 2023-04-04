import { makeAutoObservable, runInAction } from 'mobx'

import { SearchQueryParams } from '../../Types'
import { getPreviewParams } from '../../utils/utils'

import { AsyncQueryTask, AsyncQueryTaskRunner } from './AsyncTaskRunner'
import { SearchStore } from './SearchStore'

export type ViewType = 'list' | 'table'

export class SearchResultsStore {
    resultsQueryTasks: Record<string, AsyncQueryTask> = {}

    viewType: ViewType = 'list'

    error: any

    searchStore: SearchStore

    constructor(searchStore: SearchStore) {
        this.searchStore = searchStore

        makeAutoObservable(this)
    }

    private maskIrrelevantParams = (query: SearchQueryParams): SearchQueryParams => ({
        ...query,
        facets: undefined,
        filters: {
            ...(query.filters || {}),
            date: {
                from: query.filters?.date?.from,
                to: query.filters?.date?.to,
                intervals: query.filters?.date?.intervals,
            },
            ['date-created']: {
                from: query.filters?.['date-created']?.from,
                to: query.filters?.['date-created']?.to,
                intervals: query.filters?.['date-created']?.intervals,
            },
        },
    })

    queryDiffer = (query: SearchQueryParams): boolean => {
        if (!this.searchStore.query) {
            return true
        } else if (this.searchStore.query) {
            return JSON.stringify(this.maskIrrelevantParams(query)) !== JSON.stringify(this.maskIrrelevantParams(this.searchStore.query))
        }
        return false
    }

    queryResult = (query: SearchQueryParams) => {
        this.resultsQueryTasks = {}

        for (const collection of query.collections) {
            const { collections, ...queryParams } = query
            const singleCollectionQuery = { collections: [collection], ...queryParams }
            this.resultsQueryTasks[collection] = AsyncQueryTaskRunner.createAsyncQueryTask(singleCollectionQuery, 'results', '*')
        }
    }

    previewNextDoc = () => {
        /*
        if (!resultsLoading && results?.hits.hits && (parseInt(query.page) - 1) * parseInt(query.size) + currentIndex < results.hits.total - 1) {
            if (currentIndex === results.hits.hits.length - 1) {
                setPreviewOnLoad('first')
                search({ page: parseInt(query.page) + 1 })
            } else {
                setHashState({ ...getPreviewParams(results.hits.hits[currentIndex + 1]), tab: undefined, subTab: undefined, previewPage: undefined })
            }
        }
         */
    }

    previewPreviousDoc = () => {
        /*
        if ((!resultsLoading && results?.hits.hits && parseInt(query.page) > 1) || currentIndex >= 1) {
            if (currentIndex === 0 && parseInt(query.page) > 1) {
                setPreviewOnLoad('last')
                search({ page: parseInt(query.page) - 1 })
            } else {
                setHashState({ ...getPreviewParams(results.hits.hits[currentIndex - 1]), tab: undefined, subTab: undefined, previewPage: undefined })
            }
        }
         */
    }

    get resultsLoading() {
        return Object.entries(this.resultsQueryTasks).find(([_collection, queryTask]) => queryTask.data?.status !== 'done')
    }

    setViewType = (viewType: ViewType): void => {
        runInAction(() => {
            this.viewType = viewType
        })
    }

    clearResults = (): void => {
        runInAction(() => {
            this.resultsQueryTasks = {}
        })
    }
}
