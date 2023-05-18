import { makeAutoObservable, reaction } from 'mobx'
import { Entries } from 'type-fest'

import { Aggregations, AggregationsKey, SearchQueryParams } from '../../Types'

import { AsyncQueryTask, AsyncQueryTaskRunner } from './AsyncTaskRunner'
import { SearchStore } from './SearchStore'

export class SearchMissingStore {
    private missingCollections: string[] = []

    missingQueryTasks: Record<string, AsyncQueryTask> = {}

    missing: Record<string, number> = {}

    error: any

    keepFromClearing: AggregationsKey | undefined

    constructor(private readonly searchStore: SearchStore) {
        makeAutoObservable(this)

        reaction(
            () =>
                Object.entries(this.missingQueryTasks).map(([collection, { data }]) => ({ collection, aggregations: data?.result?.aggregations })),
            (results) => {
                results.forEach(({ collection, aggregations }) => {
                    if (aggregations && !this.missingCollections.includes(collection)) {
                        this.missingCollections.push(collection)
                        this.sumMissing(aggregations)
                    }
                })
            }
        )
    }

    performQuery(query: SearchQueryParams, keepFromClearing: AggregationsKey | undefined) {
        this.missingQueryTasks = {}
        this.missingCollections = []
        this.keepFromClearing = keepFromClearing

        if (keepFromClearing && Object.keys(this.missing).includes(keepFromClearing)) {
            this.missing = { [keepFromClearing]: this.missing[keepFromClearing] }
        } else {
            this.missing = {}
        }

        for (const collection of query.collections) {
            const { collections, ...queryParams } = query
            const singleCollectionQuery = { collections: [collection], ...queryParams }
            this.missingQueryTasks[collection] = AsyncQueryTaskRunner.createAsyncQueryTask(singleCollectionQuery, 'missing', '*')
        }
    }

    get missingLoading() {
        return Object.entries(this.missingQueryTasks).find(([_collection, queryTask]) => queryTask.data?.status !== 'done')
    }

    private sumMissing(aggregations: Aggregations) {
        ;(Object.entries(aggregations) as Entries<typeof aggregations>).forEach(([field, aggregation]) => {
            const docCount = aggregation?.values.doc_count || 0

            if (!this.missing[field]) {
                this.missing[field] = docCount
            } else {
                this.missing[field] += docCount
            }
        })
    }
}
