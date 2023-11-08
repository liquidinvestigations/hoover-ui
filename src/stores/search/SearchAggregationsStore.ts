import { makeAutoObservable, runInAction } from 'mobx'
import { Entries } from 'type-fest'

import { aggregationFields } from '../../constants/aggregationFields'
import { Aggregations, AggregationsKey, AsyncTaskData, SearchQueryParams, SourceField } from '../../Types'
import { AsyncQueryTaskRunner } from '../../utils/AsyncTaskRunner'
import { SharedStore } from '../SharedStore'

import { SearchStore } from './SearchStore'

export class SearchAggregationsStore {
    private aggregatedCollections: string[] = []

    aggregations: Aggregations = {}

    aggregationsLoading: Partial<Record<SourceField, number>> = SearchAggregationsStore.initialAggregationsLoading(0)

    aggregationsLoadingETA: Partial<Record<SourceField, number>> = SearchAggregationsStore.initialAggregationsLoading(0)

    error: Record<string, string> = {}

    keepFromClearing: AggregationsKey | undefined

    constructor(
        private readonly sharedStore: SharedStore,
        private readonly searchStore: SearchStore,
    ) {
        makeAutoObservable(this)
    }

    performQuery(query: SearchQueryParams, keepFromClearing: AggregationsKey | undefined, fieldList: SourceField[] | '*' = '*') {
        if (!this.sharedStore.user) return
        AsyncQueryTaskRunner.abortTasks()

        runInAction(() => {
            this.error = {}
            this.aggregatedCollections = []
            this.aggregationsLoading = SearchAggregationsStore.initialAggregationsLoading(0)
            this.aggregationsLoadingETA = SearchAggregationsStore.initialAggregationsLoading(0)
            this.keepFromClearing = keepFromClearing

            if (keepFromClearing && Object.keys(this.aggregations).includes(keepFromClearing)) {
                this.aggregations = { [keepFromClearing]: { ...this.aggregations[keepFromClearing] } }
                this.searchStore.searchMissingStore.missing = {
                    [`${keepFromClearing}-missing`]: this.searchStore.searchMissingStore.missing[`${keepFromClearing}-missing`],
                }
            } else {
                this.aggregations = {}
                this.searchStore.searchMissingStore.missing = {}
            }
        })

        const setAggregationsLoading = (value: number) => {
            if (fieldList === '*') {
                for (const field in this.aggregationsLoading) {
                    runInAction(() => {
                        this.aggregationsLoading[field as SourceField]! += value
                    })
                }
            } else {
                fieldList.forEach((field) => {
                    runInAction(() => {
                        this.aggregationsLoading[field as SourceField]! += value
                    })
                })
            }
        }

        const setAggregationsLoadingETA = (value: number) => {
            if (fieldList === '*') {
                for (const field in this.aggregationsLoadingETA) {
                    runInAction(() => {
                        this.aggregationsLoadingETA[field as SourceField]! = value
                    })
                }
            } else {
                fieldList.forEach((field) => {
                    runInAction(() => {
                        this.aggregationsLoadingETA[field] = value
                    })
                })
            }
        }

        for (const collection of query.collections) {
            const { excludedFields, ...queryParams } = query
            const singleCollectionQuery = { ...queryParams, collections: [collection] }

            const task = AsyncQueryTaskRunner.createAsyncQueryTask(
                singleCollectionQuery,
                'aggregations',
                fieldList,
                this.sharedStore.fields!,
                excludedFields || [],
                this.sharedStore.user.uuid!,
            )

            task.addEventListener('done', (event) => {
                const { detail: data } = event as CustomEvent<AsyncTaskData>

                if (data.result?.aggregations && !this.aggregatedCollections.includes(collection)) {
                    this.aggregatedCollections.push(collection)
                    this.combineAggregations(data.result.aggregations, keepFromClearing)
                    this.sortAggregations()
                }
            })

            task.addEventListener('eta', (event) => {
                const { detail: eta } = event as CustomEvent<number>

                setAggregationsLoadingETA(eta)
            })

            task.addEventListener('error', (event) => {
                const { error } = event as ErrorEvent

                setAggregationsLoading(-1)

                if (error.name !== 'AbortError') {
                    this.error[collection] = error
                }
            })

            setAggregationsLoading(1)
        }
    }

    private combineAggregations(aggregations: Aggregations, keepFromClearing: AggregationsKey | undefined) {
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
                if (this.aggregations[field]?.count && aggregation?.count && field !== keepFromClearing) {
                    this.aggregations[field]!.count.value += aggregation.count.value
                }
            }
            this.aggregationsLoading[field as SourceField]!--
        })
    }

    private sortAggregations() {
        ;(Object.entries(this.aggregations) as Entries<typeof this.aggregations>).forEach(([field]) => {
            if (aggregationFields[field as SourceField]?.sort) {
                this.aggregations[field]?.values.buckets?.sort((a, b) => b.doc_count - a.doc_count)
            }
        })
    }

    private static initialAggregationsLoading = (value: number) => Object.fromEntries(Object.keys(aggregationFields).map((field) => [field, value]))
}
