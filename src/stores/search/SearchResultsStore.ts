import { makeAutoObservable, reaction, runInAction } from 'mobx'

import { Hit, SearchQueryParams } from '../../Types'
import { getPreviewParams } from '../../utils/utils'
import { SharedStore } from '../SharedStore'

import { AsyncQueryTask, AsyncQueryTaskRunner } from './AsyncTaskRunner'
import { SearchStore } from './SearchStore'

type PreviewOnLoad = 'first' | 'last' | undefined

export class SearchResultsStore {
    resultsQueryTasks: Record<string, AsyncQueryTask> = {}

    error: any

    previewOnLoad: PreviewOnLoad

    constructor(private readonly sharedStore: SharedStore, private readonly searchStore: SearchStore) {
        makeAutoObservable(this)

        reaction(
            () => this.hits,
            (hits) => {
                if (this.previewOnLoad === 'first' && hits[0]) {
                    this.openPreview(hits[0])
                } else if (this.previewOnLoad === 'last' && hits[hits.length - 1]) {
                    this.openPreview(hits[hits.length - 1])
                }
            }
        )
    }

    maskIrrelevantParams = (query: SearchQueryParams): SearchQueryParams => ({
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

    performQuery = (query: SearchQueryParams) => {
        this.resultsQueryTasks = {}

        for (const collection of query.collections) {
            const { collections, ...queryParams } = query
            const singleCollectionQuery = { collections: [collection], ...queryParams }
            this.resultsQueryTasks[collection] = AsyncQueryTaskRunner.createAsyncQueryTask(singleCollectionQuery, 'results', '*')
        }
    }

    previewNextDoc = () => {
        const page = this.searchStore.query?.page || 1
        const size = this.searchStore.query?.size || 0
        const currentIndex = this.currentPreviewIndex
        const hits = this.hits

        if (!this.resultsLoading && hits && (page - 1) * size + currentIndex < this.hitsTotal - 1) {
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

        if ((!this.resultsLoading && hits && page > 1) || currentIndex >= 1) {
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

    get resultsLoading() {
        return Object.entries(this.resultsQueryTasks).find(([_collection, queryTask]) => queryTask.data?.status !== 'done')
    }

    get hits() {
        return Object.entries(this.resultsQueryTasks)
            .sort(([a], [b]) => this.resultsSortCompareFn(a, b))
            .reduce((hits, [_collection, queryTask]) => {
                hits.push(...(queryTask.data?.result?.hits.hits || []))

                return hits
            }, [] as Hit[])
    }

    get hitsTotal() {
        return Object.entries(this.resultsQueryTasks).reduce(
            (total, [_collection, queryTask]) => Math.max(queryTask.data?.result?.hits.total || 0, total),
            0
        )
    }

    setPreviewOnLoad = (previewOnLoad: PreviewOnLoad): void => {
        runInAction(() => {
            this.previewOnLoad = previewOnLoad
        })
    }

    clearResults = (): void => {
        runInAction(() => {
            this.resultsQueryTasks = {}
        })
    }

    resultsSortCompareFn = (a: string, b: string) => {
        if (this.resultsQueryTasks[a]?.data?.result && this.resultsQueryTasks[b]?.data?.result) {
            // @ts-ignore
            return this.resultsQueryTasks[b].data.result.hits.total - this.resultsQueryTasks[a].data.result.hits.total
        } else if (this.resultsQueryTasks[a]?.data?.result) {
            return -1
        } else if (this.resultsQueryTasks[b]?.data?.result) {
            return 1
        } else return 0
    }
}
