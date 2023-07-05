import { makeAutoObservable, runInAction } from 'mobx'
import { Entries } from 'type-fest'

import { aggregationFields } from '../../constants/aggregationFields'
import { Aggregations, AggregationsKey, AsyncTaskData, SearchQueryParams, SourceField } from '../../Types'

import { AsyncQueryTaskRunner } from './AsyncTaskRunner'
import { SearchStore } from './SearchStore'

export class SearchAggregationsStore {
    private aggregatedCollections: string[] = []

    aggregations: Aggregations = {}

    aggregationsLoading: Partial<Record<SourceField, number>> = SearchAggregationsStore.initialAggregationsLoading(0)

    aggregationsLoadingETA: Partial<Record<SourceField, number>> = SearchAggregationsStore.initialAggregationsLoading(0)

    error: Record<string, string> = {}

    keepFromClearing: AggregationsKey | undefined

    constructor(private readonly searchStore: SearchStore) {
        makeAutoObservable(this)
    }

    performQuery(query: SearchQueryParams, keepFromClearing: AggregationsKey | undefined, fieldList: SourceField[] | '*' = '*') {
        AsyncQueryTaskRunner.clearQueue()

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
                        // @ts-ignore
                        this.aggregationsLoading[field] += value
                    })
                }
            } else {
                fieldList.forEach((field) => {
                    runInAction(() => {
                        // @ts-ignore
                        this.aggregationsLoading[field] += value
                    })
                })
            }
        }

        const setAggregationsLoadingETA = (value: number) => {
            if (fieldList === '*') {
                for (const field in this.aggregationsLoadingETA) {
                    runInAction(() => {
                        // @ts-ignore
                        this.aggregationsLoadingETA[field] = value
                    })
                }
            } else {
                fieldList.forEach((field) => {
                    // @ts-ignore
                    runInAction(() => {
                        this.aggregationsLoadingETA[field] = value
                    })
                })
            }
        }

        for (const collection of query.collections) {
            const { collections, ...queryParams } = query
            const singleCollectionQuery = { collections: [collection], ...queryParams }

            const task = AsyncQueryTaskRunner.createAsyncQueryTask(singleCollectionQuery, 'aggregations', fieldList)

            task.addEventListener('done', (event) => {
                const { detail: data } = event as CustomEvent<AsyncTaskData>

                if (data.result?.aggregations && !this.aggregatedCollections.includes(collection)) {
                    this.aggregatedCollections.push(collection)
                    this.combineAggregations(data.result.aggregations)
                    this.sortAggregations()
                }
            })

            task.addEventListener('eta', (event) => {
                const { detail: eta } = event as CustomEvent<number>

                setAggregationsLoadingETA(eta)
            })

            task.addEventListener('error', (event) => {
                const { message } = event as ErrorEvent

                this.error[collection] = message
                setAggregationsLoading(-1)
            })

            setAggregationsLoading(1)
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
                if (this.aggregations[field]?.count && aggregation?.count) {
                    // @ts-ignore
                    this.aggregations[field].count.value += aggregation.count.value
                }
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

    private static initialAggregationsLoading = (value: number) => Object.fromEntries(Object.keys(aggregationFields).map((field) => [field, value]))
}
