import { makeAutoObservable, reaction, runInAction } from 'mobx'

import { DEDUPLICATE_OPTIONS, UNIFY_RESULTS } from '../../consts'
import { AsyncTaskData, Category, Hit, Hits, SearchQueryParams } from '../../Types'
import { AsyncQueryTaskRunner } from '../../utils/AsyncTaskRunner'
import { getPreviewParams, mergeSort } from '../../utils/utils'
import { SharedStore } from '../SharedStore'

import { SearchStore } from './SearchStore'

type PreviewOnLoad = 'first' | 'last' | undefined

export interface Result {
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

    performQuery = async (query: SearchQueryParams) => {
        if (!this.sharedStore.user) return
        runInAction(() => {
            this.error = {}
        })

        const promises = query.collections.map((collection: string) => {
            const { excludedFields, dedup_results = DEDUPLICATE_OPTIONS.show, ...queryParams } = query
            const singleCollectionQuery = {
                ...queryParams,
                collections: [collection],
                dedup_collections: dedup_results ? query.collections : undefined,
            }

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

            return new Promise<{ collection: string; data: AsyncTaskData }>((resolve, reject) => {
                task.addEventListener('done', (event) => {
                    const { detail: data } = event as CustomEvent<AsyncTaskData>

                    if (!query?.unify_results || query.unify_results === UNIFY_RESULTS.inactive) {
                        runInAction(() => {
                            const { result, resultsCount } = this.handleAsyncTaskResult(collection, data, query.dedup_results)

                            const resultTmp = this.results.find((res) => res.collection === collection)
                            if (resultTmp) {
                                resultTmp.hits = result.hits
                                this.resultsCounts[collection] = resultsCount
                            }

                            delete this.resultsLoadingETA[collection]
                        })
                    }

                    resolve({ collection, data })
                })

                task.addEventListener('eta', (event) => {
                    const { detail: eta } = event as CustomEvent<number>

                    runInAction(() => {
                        this.resultsLoadingETA[collection] = eta ?? 0
                    })
                })

                task.addEventListener('error', (event) => {
                    const { error } = event as ErrorEvent

                    runInAction(() => {
                        delete this.resultsLoadingETA[collection]

                        if (error.name !== 'AbortError') {
                            this.error[collection] = error
                        }
                    })

                    reject()
                })
            })
        })

        if (query.unify_results || query.unify_results === UNIFY_RESULTS.active) {
            await Promise.all(promises)
                .then((response) => {
                    const [resultsData, resultsCountsData] = response.reduce(
                        (prev: any, { collection, data }) => {
                            const [prevResult, prevResultCount] = prev
                            const { result, resultsCount } = this.handleAsyncTaskResult(collection, data, query.dedup_results)
                            return [
                                [...prevResult, result],
                                [...prevResultCount, { [collection]: resultsCount }],
                            ]
                        },
                        [[], []],
                    )
                    runInAction(() => {
                        this.results = resultsData
                        this.resultsCounts = resultsCountsData
                    })
                })
                .finally(() => {
                    runInAction(() => {
                        this.results.forEach(({ collection }) => {
                            delete this.resultsLoadingETA[collection]
                        })
                    })
                })
        }

        Promise.all(promises).finally(() => {
            runInAction(() => {
                this.hits = mergeSort(
                    this.results.map((result) => result.hits?.hits || []),
                    (left, right) => left._score >= right._score,
                )
            })
        })
    }

    handleAsyncTaskResult = (collection: string, data: AsyncTaskData, dedup_results?: string) => {
        const result = { ...this.results.find(({ collection: initCollection }) => collection === initCollection) }
        if (result && data.result?.hits) {
            const { hits, ...rest } = data.result.hits
            result.hits = {
                ...rest,
                hits: dedup_results === DEDUPLICATE_OPTIONS.hide ? hits.filter(({ _dedup_hide_result }) => !_dedup_hide_result) : hits,
            }
        }

        const resultsCount = data.result?.count_by_index?.[collection as Category] as number

        return { result, resultsCount }
    }

    previewNextDoc = () => {
        const page = this.searchStore.query?.page || 1
        const size = this.searchStore.query?.size || 0
        const currentIndex = this.currentPreviewIndex
        const hits = this.hits

        if (!Object.keys(this.resultsLoadingETA).length && hits && (page - 1) * size + currentIndex < this.hitsTotal - 1) {
            if (currentIndex === hits.length - 1) {
                this.setPreviewOnLoad('first')
                this.searchStore.navigateSearch({ page: page + 1 })
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
                this.searchStore.navigateSearch({ page: page - 1 })
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

    get unifiedResults(): Result {
        return {
            collection: this.results
                .map(({ collection }) => collection)
                .sort()
                .join(', '),
            hits: { hits: this.hits, max_score: this.hits?.[0]?._score, total: this.hits.length },
        }
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
