import { makeAutoObservable, runInAction } from 'mobx'
import { Entries } from 'type-fest'

import { Aggregations, AsyncTaskData, SearchQueryParams, SourceField } from '../../Types'
import { AsyncQueryTaskRunner } from '../../utils/AsyncTaskRunner'
import { SharedStore } from '../SharedStore'

import { SearchStore } from './SearchStore'

export class SearchMissingStore {
    missing: Record<string, number> = {}

    missingLoading = 0

    missingLoadingETA = 0

    error: Record<string, string> = {}

    constructor(
        private readonly sharedStore: SharedStore,
        private readonly searchStore: SearchStore,
    ) {
        makeAutoObservable(this)
    }

    performQuery(query: SearchQueryParams, fieldList: SourceField[] | '*' = '*') {
        if (this.missing[`${fieldList}-missing`]) {
            return
        }

        for (const collection of query.collections) {
            const { excludedFields, ...queryParams } = query
            const singleCollectionQuery = { ...queryParams, collections: [collection] }

            runInAction(() => {
                this.error = {}
                this.missingLoading++
            })

            const task = AsyncQueryTaskRunner.createAsyncQueryTask(
                singleCollectionQuery,
                'missing',
                fieldList,
                this.sharedStore.fields!,
                excludedFields || [],
                this.sharedStore.user?.uuid!,
            )

            task.addEventListener('done', (event) => {
                const { detail: data } = event as CustomEvent<AsyncTaskData>

                if (data.result?.aggregations) {
                    this.sumMissing(data.result.aggregations)
                }

                runInAction(() => {
                    this.missingLoading--
                })
            })

            task.addEventListener('eta', (event) => {
                const { detail: eta } = event as CustomEvent<number>

                runInAction(() => {
                    this.missingLoadingETA = eta
                })
            })

            task.addEventListener('error', (event) => {
                const { message } = event as ErrorEvent

                runInAction(() => {
                    this.error[collection] = message
                    this.missingLoading--
                })
            })
        }
    }

    private sumMissing(aggregations: Aggregations) {
        (Object.entries(aggregations) as Entries<typeof aggregations>).forEach(([field, aggregation]) => {
            const docCount = aggregation?.values?.doc_count || 0

            if (this.missing[field] === undefined) {
                this.missing[field] = docCount
            } else {
                this.missing[field] += docCount
            }
        })
    }
}
