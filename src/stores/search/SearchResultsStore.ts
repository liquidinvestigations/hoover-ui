import { makeAutoObservable, runInAction } from 'mobx'
import { SearchStore } from './SearchStore'
import { SearchQueryParams } from '../../Types'
import { AsyncQueryTask, AsyncQueryTaskRunner } from './AsyncTaskRunner'

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

    setViewType = (viewType: ViewType): void => {
        runInAction(() => {
            this.viewType = viewType
        })
    }
}
