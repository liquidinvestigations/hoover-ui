import { makeAutoObservable } from 'mobx'

import { SearchQueryParams } from '../../Types'
import { defaultSearchParams } from '../../utils/queryUtils'

import { AsyncQueryTask, AsyncQueryTaskRunner } from './AsyncTaskRunner'
import { SearchStore } from './SearchStore'

export class SearchAggregationsStore {
    aggregationsQueryTasks: Record<string, AsyncQueryTask> = {}

    missingAggregationsQueryTasks: any

    error: any

    constructor(private readonly searchStore: SearchStore) {
        makeAutoObservable(this)
    }

    maskIrrelevantParams = (query: SearchQueryParams): SearchQueryParams => ({
        ...query,
        facets: undefined,
        page: defaultSearchParams.page,
        size: defaultSearchParams.size,
        order: undefined,
    })

    queryResult = (query: SearchQueryParams) => {
        this.aggregationsQueryTasks = {}

        for (const collection of query.collections) {
            const { collections, ...queryParams } = query
            const singleCollectionQuery = { collections: [collection], ...queryParams }
            this.aggregationsQueryTasks[collection] = AsyncQueryTaskRunner.createAsyncQueryTask(singleCollectionQuery, 'aggregations', '*')
        }
    }

    get aggregationsLoading() {
        return Object.entries(this.aggregationsQueryTasks).find(([_collection, queryTask]) => queryTask.data?.status !== 'done')
    }
}
