import { makeAutoObservable, runInAction } from 'mobx'
import qs from 'qs'

import { AggregationsKey, SearchQueryParams, SourceField } from '../../Types'
import fixLegacyQuery from '../../utils/fixLegacyQuery'
import { buildSearchQuerystring, defaultSearchParams, unwindParams } from '../../utils/queryUtils'
import { SharedStore } from '../SharedStore'

import { FiltersStore } from './FiltersStore'
import { SearchAggregationsStore } from './SearchAggregationsStore'
import { SearchMissingStore } from './SearchMissingStore'
import { SearchResultsStore } from './SearchResultsStore'
import { SearchViewStore } from './SearchViewStore'

export enum SearchType {
    Aggregations = 1 << 0, // 0001
    Results = 1 << 1, // 0010
    Missing = 1 << 2, // 0100
}

interface SearchOptions {
    queued?: boolean
    searchType?: number
    fieldList?: SourceField[] | '*'
    keepFromClearing?: AggregationsKey
}

export class SearchStore {
    query: SearchQueryParams | undefined

    filtersStore: FiltersStore

    searchViewStore: SearchViewStore

    searchAggregationsStore: SearchAggregationsStore

    searchMissingStore: SearchMissingStore

    searchResultsStore: SearchResultsStore

    queuedQuery: Partial<SearchQueryParams> | undefined

    constructor(private readonly sharedStore: SharedStore) {
        this.searchViewStore = new SearchViewStore(sharedStore, this)
        this.searchAggregationsStore = new SearchAggregationsStore(sharedStore, this)
        this.searchMissingStore = new SearchMissingStore(sharedStore, this)
        this.searchResultsStore = new SearchResultsStore(sharedStore, this)
        this.filtersStore = new FiltersStore(this)

        makeAutoObservable(this)
    }

    private getMergedParams(params: Partial<SearchQueryParams>) {
        const { searchText, searchCollections } = this.searchViewStore
        return {
            ...this.query,
            ...{ q: searchText, collections: searchCollections, excludedFields: this.sharedStore.excludedFields },
            ...defaultSearchParams,
            ...params,
        }
    }

    private updateStoresBasedOnSearchType(query: Partial<SearchQueryParams>, options: SearchOptions) {
        const { searchType, keepFromClearing, fieldList } = {
            ...{ searchType: SearchType.Aggregations | SearchType.Results },
            ...options,
        }

        if (searchType & SearchType.Results) {
            this.searchResultsStore.clearResults()
        }

        if (query.q && query.page && query.size && query.collections?.length) {
            this.performQueriesBasedOnType(query as SearchQueryParams, searchType, keepFromClearing, fieldList as SourceField[])
        }
    }

    private performQueriesBasedOnType(query: SearchQueryParams, searchType: SearchType, keepFromClearing?: AggregationsKey, fieldList?: SourceField[]) {
        if (searchType & SearchType.Aggregations) {
            this.searchAggregationsStore.performQuery(query, keepFromClearing, fieldList)
        }
        if (searchType & SearchType.Missing) {
            this.searchMissingStore.performQuery(query, fieldList)
        }
        if (searchType & SearchType.Results) {
            this.searchResultsStore.performQuery(query)
        }
    }

    queueSearch = (query: string): void => {
        this.queuedQuery = this.parseSearchParams(query)
    }

    clearQueued = (): void => {
        runInAction(() => {
            this.queuedQuery = undefined
        })
    }

    parseSearchParams = (search: string): Partial<SearchQueryParams> => {
        const parsedQuery = fixLegacyQuery(unwindParams(qs.parse(search, { arrayLimit: 100 })))

        parsedQuery.page = parseInt(parsedQuery.page as string)
        parsedQuery.size = parseInt(parsedQuery.size as string)

        this.searchViewStore.searchText = (parsedQuery.q as string) || ''
        this.searchViewStore.searchCollections = (parsedQuery.collections as string[]) || []
        this.sharedStore.excludedFields = (parsedQuery.excludedFields as string[]) || []

        return parsedQuery
    }

    search = (params: Partial<SearchQueryParams> = {}, options: SearchOptions = {}) => {
        const mergedParams = this.getMergedParams(params)
        const queryString = buildSearchQuerystring(mergedParams)
        const query = this.parseSearchParams(queryString)

        this.updateStoresBasedOnSearchType(query, options)

        if (query?.collections?.length) {
            this.searchViewStore.searchCollections = query.collections
        }

        /*if (!options.queued) {
            const path = '?' + queryString + window.location.hash
            void Router.router?.changeState('pushState', path, path, { shallow: true })
        }*/

        this.query = query as SearchQueryParams

        return '?' + queryString + window.location.hash
    }

    onFieldInclusionChange = (field: string) => () => {
        if (this.sharedStore.excludedFields.includes(field)) {
            runInAction(() => {
                this.sharedStore.excludedFields = this.sharedStore.excludedFields.filter((f) => f !== field)
            })
        } else {
            runInAction(() => {
                this.sharedStore.excludedFields = [...this.sharedStore.excludedFields, field]
            })
        }
        if (this.query?.q) {
            this.search()
        }
    }
}
