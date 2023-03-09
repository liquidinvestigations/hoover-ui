import { makeAutoObservable, reaction } from 'mobx'
import { Entries } from 'type-fest'

import { Aggregations, SearchQueryParams } from '../../Types'
import { defaultSearchParams } from '../../utils/queryUtils'

import { AsyncQueryTask, AsyncQueryTaskRunner } from './AsyncTaskRunner'
import { SearchStore } from './SearchStore'

export class SearchAggregationsStore {
    /*private*/ aggregationsQueryTasks: Record<string, AsyncQueryTask> = {}
    private aggregatedCollections: string[] = []

    aggregations: Aggregations = {}

    missingAggregationsQueryTasks: any

    error: any

    constructor(private readonly searchStore: SearchStore) {
        makeAutoObservable(this)

        reaction(
            () =>
                Object.entries(this.aggregationsQueryTasks).map(([collection, { data }]) => ({ collection, aggregations: data?.result?.aggregations })),
            (results) => {
                results.forEach(({ collection, aggregations }) => {
                    if (aggregations && !this.aggregatedCollections.includes(collection)) {
                        this.aggregatedCollections.push(collection)
                        this.combineAggregations(aggregations)
                    }
                })
            }
        )
    }

    queryResult(query: SearchQueryParams) {
        this.aggregationsQueryTasks = {}
        this.aggregatedCollections = []
        this.aggregations = {}

        for (const collection of query.collections) {
            const { collections, ...queryParams } = query
            const singleCollectionQuery = { collections: [collection], ...queryParams }
            this.aggregationsQueryTasks[collection] = AsyncQueryTaskRunner.createAsyncQueryTask(singleCollectionQuery, 'aggregations', '*')
        }
    }

    get aggregationsLoading() {
        return Object.entries(this.aggregationsQueryTasks).find(([_collection, queryTask]) => queryTask.data?.status !== 'done')
    }

    private combineAggregations(aggregations: Aggregations) {
        ;(Object.entries(aggregations) as Entries<typeof aggregations>).forEach(([field, aggregation]) => {
            if (!this.aggregations[field]) {
                this.aggregations[field] = aggregation
            } else {
                aggregation?.values?.buckets?.forEach((newBucket) => {
                    const existingBucket = this.aggregations[field]?.values.buckets?.find((exBucket) => exBucket.key === newBucket.key)
                    if (!existingBucket) {
                        this.aggregations[field]?.values.buckets?.push(newBucket)
                    } else {
                        existingBucket.doc_count += newBucket.doc_count
                    }
                })
            }
        })
    }
}
