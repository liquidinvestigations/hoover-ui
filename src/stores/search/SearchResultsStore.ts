import { makeAutoObservable, reaction, runInAction } from 'mobx'

import { AsyncTaskData, Category, Hit, Hits, SearchQueryParams } from '../../Types'
import { AsyncQueryTaskRunner } from '../../utils/AsyncTaskRunner'
import { getPreviewParams } from '../../utils/utils'
import { SharedStore } from '../SharedStore'

import { SearchStore } from './SearchStore'

type PreviewOnLoad = 'first' | 'last' | undefined

interface Result {
    collection: string
    hits?: Hits
}

export class SearchResultsStore {
    results: Result[] = []

    resultsCounts: Record<string, number> = {}

    resultsLoadingETA: Record<string, number> = {}

    hits: Hit[] = []

    error: Record<string, string> = {}

    previewOnLoad: PreviewOnLoad

    constructor(
        private readonly sharedStore: SharedStore,
        private readonly searchStore: SearchStore,
    ) {
        makeAutoObservable(this)

        reaction(
            () => this.hits,
            (hits) => {
                if (this.previewOnLoad === 'first' && hits[0]) {
                    this.openPreview(hits[0])
                } else if (this.previewOnLoad === 'last' && hits[hits.length - 1]) {
                    this.openPreview(hits[hits.length - 1])
                }
            },
        )
    }

    performQuery = (query: SearchQueryParams) => {
        runInAction(() => {
            this.error = {}
        })

        for (const collection of query.collections) {
            const { excludedFields, ...queryParams } = query
            const singleCollectionQuery = { ...queryParams, collections: [collection] }

            runInAction(() => {
                this.results.push({ collection })
            })

            const task = AsyncQueryTaskRunner.createAsyncQueryTask(
                singleCollectionQuery,
                'results',
                '*',
                this.sharedStore.fields!,
                excludedFields || [],
                this.sharedStore.user?.uuid!,
            )

            task.addEventListener('done', (event) => {
                const { detail: data } = event as CustomEvent<AsyncTaskData>

                runInAction(() => {
                    const initResult = this.results.find(({ collection: initCollection }) => collection === initCollection)
                    if (initResult) {
                        initResult.hits = data.result?.hits as Hits
                    }

                    this.results.sort(this.resultsSortCompareFn)

                    this.resultsCounts[collection] = data.result?.count_by_index?.[collection as Category] as number

                    this.hits = this.results.reduce((accHits, { hits }) => {
                        accHits.push(...(hits?.hits || []))

                        return accHits
                    }, [] as Hit[])

                    delete this.resultsLoadingETA[collection]
                })
            })

            task.addEventListener('eta', (event) => {
                const { detail: eta } = event as CustomEvent<number>

                runInAction(() => {
                    this.resultsLoadingETA[collection] = eta
                })
            })

            task.addEventListener('error', (event) => {
                const { message } = event as ErrorEvent

                runInAction(() => {
                    this.error[collection] = message
                    delete this.resultsLoadingETA[collection]
                })
            })
        }
    }

    previewNextDoc = () => {
        const page = this.searchStore.query?.page || 1
        const size = this.searchStore.query?.size || 0
        const currentIndex = this.currentPreviewIndex
        const hits = this.hits

        if (!Object.keys(this.resultsLoadingETA).length && hits && (page - 1) * size + currentIndex < this.hitsTotal - 1) {
            if (currentIndex === hits.length - 1) {
                this.setPreviewOnLoad('first')
                this.searchStore.search({ page: page + 1 })
            } else {
                this.openPreview(hits[currentIndex + 1])
            }
        }
    }

    previewPreviousDoc = () => {
        const page = this.searchStore.query?.page || 1
        const currentIndex = this.currentPreviewIndex
        const hits = this.hits

        if ((!Object.keys(this.resultsLoadingETA).length && hits && page > 1) || currentIndex >= 1) {
            if (currentIndex === 0 && page > 1) {
                this.setPreviewOnLoad('last')
                this.searchStore.search({ page: page - 1 })
            } else {
                this.openPreview(hits[currentIndex - 1])
            }
        }
    }

    openPreview = (hit: Hit) => {
        this.sharedStore.hashStore.setHashState({
            ...getPreviewParams(hit),
            tab: undefined,
            subTab: undefined,
            previewPage: undefined,
        })
    }

    get currentPreviewIndex() {
        const hashState = this.sharedStore.hashStore.hashState

        return this.hits.findIndex((hit) => hit._collection === hashState.preview?.c && hit._id === hashState.preview?.i)
    }

    get hitsTotal() {
        return this.results.reduce((total, { hits }) => Math.max(hits?.total || 0, total), 0)
    }

    setPreviewOnLoad = (previewOnLoad: PreviewOnLoad): void => {
        runInAction(() => {
            this.previewOnLoad = previewOnLoad
        })
    }

    clearResults = (): void => {
        runInAction(() => {
            this.results = []
            this.resultsCounts = {}
            this.hits = []
        })
    }

    resultsSortCompareFn = (a: Result, b: Result) => {
        if (a.hits && b.hits) {
            return b.hits.total - a.hits.total
        } else if (a.hits) {
            return -1
        } else if (b.hits) {
            return 1
        } else return 0
    }
}
