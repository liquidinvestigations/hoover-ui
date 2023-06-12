import { makeAutoObservable, reaction } from 'mobx'
import { Entries } from 'type-fest'

import { aggregationFields } from '../../constants/aggregationFields'
import { Aggregations, AggregationsKey, SearchQueryParams, SourceField } from '../../Types'

import { AsyncQueryTask, AsyncQueryTaskRunner } from './AsyncTaskRunner'
import { SearchStore } from './SearchStore'

export class SearchAggregationsStore {
    private aggregatedCollections: string[] = []

    aggregationsQueryTasks: Record<string, AsyncQueryTask> = {}

    aggregations: Aggregations = {}

    aggregationsLoading: Partial<Record<SourceField, number>> = SearchAggregationsStore.initialAggregationsLoading()

    error: any

    keepFromClearing: AggregationsKey | undefined

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
                        this.sortAggregations()
                    }
                })
            }
        )
    }

    performQuery(query: SearchQueryParams, keepFromClearing: AggregationsKey | undefined, fieldList: SourceField[] | '*' = '*') {
        this.aggregationsQueryTasks = {}
        this.aggregatedCollections = []
        this.aggregationsLoading = SearchAggregationsStore.initialAggregationsLoading()
        this.keepFromClearing = keepFromClearing

        if (keepFromClearing && Object.keys(this.aggregations).includes(keepFromClearing)) {
            this.aggregations = { [keepFromClearing]: { ...this.aggregations[keepFromClearing] } }
            this.searchStore.searchMissingStore.missing = {
                [keepFromClearing]: this.searchStore.searchMissingStore.missing[`${keepFromClearing}-missing`],
            }
        } else {
            this.aggregations = {}
            this.searchStore.searchMissingStore.missing = {}
        }

        for (const collection of query.collections) {
            const { collections, ...queryParams } = query
            const singleCollectionQuery = { collections: [collection], ...queryParams }
            this.aggregationsQueryTasks[collection] = AsyncQueryTaskRunner.createAsyncQueryTask(singleCollectionQuery, 'aggregations', fieldList)

            if (fieldList === '*') {
                for (const field in this.aggregationsLoading) {
                    // @ts-ignore
                    this.aggregationsLoading[field]++
                }
            } else {
                fieldList.forEach((field) => {
                    // @ts-ignore
                    this.aggregationsLoading[field]++
                })
            }
        }
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
                // @ts-ignore
                this.aggregations[field].count.value += aggregation.count.value
            }
            // @ts-ignore
            this.aggregationsLoading[field]--
        })
    }

    private sortAggregations() {
        ;(Object.entries(this.aggregations) as Entries<typeof this.aggregations>).forEach(([field, aggregation]) => {
            if (aggregationFields[field as SourceField]?.sort) {
                this.aggregations[field]?.values.buckets?.sort((a, b) => b.doc_count - a.doc_count)
            }
        })
    }

    private static initialAggregationsLoading = () => Object.fromEntries(Object.keys(aggregationFields).map((field) => [field, 0]))
}
