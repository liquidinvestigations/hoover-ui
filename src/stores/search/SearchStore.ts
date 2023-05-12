import { makeAutoObservable } from 'mobx'
import qs from 'qs'

import { AggregationsKey, SearchQueryParams } from '../../Types'
import fixLegacyQuery from '../../utils/fixLegacyQuery'
import { buildSearchQuerystring, defaultSearchParams, unwindParams } from '../../utils/queryUtils'
import { SharedStore } from '../SharedStore'

import { FiltersStore } from './FiltersStore'
import { SearchAggregationsStore } from './SearchAggregationsStore'
import { SearchResultsStore } from './SearchResultsStore'
import { SearchViewStore } from './SearchViewStore'

export enum SearchType {
    Aggregations = 1 << 0, // 0001
    Results = 1 << 1, // 0010
    Missing = 1 << 2, // 0100
}

interface SearchOptions {
    searchType?: number
    keepFromClearing?: AggregationsKey
}

export class SearchStore {
    query: SearchQueryParams | undefined

    filtersStore: FiltersStore

    searchViewStore: SearchViewStore

    searchAggregationsStore: SearchAggregationsStore

    searchResultsStore: SearchResultsStore

    constructor(private readonly sharedStore: SharedStore) {
        this.filtersStore = new FiltersStore(this)
        this.searchViewStore = new SearchViewStore(sharedStore, this)
        this.searchAggregationsStore = new SearchAggregationsStore(this)
        this.searchResultsStore = new SearchResultsStore(this)

        makeAutoObservable(this)
    }

    parseSearchParams = (search: string): Partial<SearchQueryParams> => {
        const parsedQuery = fixLegacyQuery(unwindParams(qs.parse(search, { arrayLimit: 100 })))

        this.searchViewStore.searchText = parsedQuery.q
        this.searchViewStore.searchCollections = parsedQuery.collections

        return parsedQuery
    }

    search = (params: Partial<SearchQueryParams> = {}, options: SearchOptions) => {
        const { searchText, searchCollections } = this.searchViewStore

        const { searchType, keepFromClearing } = {
            ...{ searchType: SearchType.Aggregations | SearchType.Results},
            ...options,
        }

        if (searchType & SearchType.Results) {
            this.searchResultsStore.clearResults()
        }

        const mergedParams = {
            ...this.query,
            ...{ q: searchText, collections: searchCollections },
            ...defaultSearchParams,
            ...params,
        }

        const queryString = buildSearchQuerystring(mergedParams)
        const query = this.parseSearchParams(queryString)

        if (query.q && query.page && query.size && query.collections?.length) {
            if (searchType & SearchType.Aggregations) {
                this.searchAggregationsStore.queryResult(query as SearchQueryParams, keepFromClearing)
            }

            if (searchType & SearchType.Results) {
                this.searchResultsStore.queryResult(query as SearchQueryParams)
            }
        }

        if (query?.collections?.length) {
            this.searchViewStore.searchCollections = query.collections
        }

        if (this.sharedStore.navigation) {
            this.sharedStore.navigation.searchParams.replace(queryString)
        }

        this.query = query as SearchQueryParams
    }
}
