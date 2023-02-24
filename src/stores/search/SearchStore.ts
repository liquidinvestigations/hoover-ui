import { makeAutoObservable } from 'mobx'
import qs from 'qs'

import { SearchQueryParams } from '../../Types'
import fixLegacyQuery from '../../utils/fixLegacyQuery'
import { buildSearchQuerystring, defaultSearchParams, unwindParams } from '../../utils/queryUtils'
import { SharedStore } from '../SharedStore'

import { FiltersStore } from './FiltersStore'
import { SearchAggregationsStore } from './SearchAggregationsStore'
import { SearchResultsStore } from './SearchResultsStore'
import { SearchViewStore } from './SearchViewStore'

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

        if (parsedQuery.q) {
            this.searchViewStore.searchText = parsedQuery.q
        }

        if (parsedQuery.collections) {
            this.searchViewStore.searchCollections = parsedQuery.collections
        }

        return parsedQuery
    }

    queryDiffer = (query: SearchQueryParams, maskIrrelevantParams: (query: SearchQueryParams) => SearchQueryParams): boolean => {
        if (!this.query) {
            return true
        } else if (this.query) {
            return JSON.stringify(maskIrrelevantParams(query)) !== JSON.stringify(maskIrrelevantParams(this.query))
        }
        return false
    }

    search = (params: Partial<SearchQueryParams> = {}) => {
        const { searchText, searchCollections } = this.searchViewStore

        const mergedParams = {
            ...this.query,
            ...params,
            ...defaultSearchParams,
            ...{ q: searchText, collections: searchCollections },
        }

        const queryString = buildSearchQuerystring(mergedParams)
        const query = this.parseSearchParams(queryString)

        if (query.q && query.page && query.size && query.collections?.length) {
            if (this.queryDiffer(query as SearchQueryParams, this.searchResultsStore.maskIrrelevantParams)) {
                this.searchResultsStore.queryResult(query as SearchQueryParams)
            }

            if (this.queryDiffer(query as SearchQueryParams, this.searchAggregationsStore.maskIrrelevantParams)) {
                this.searchAggregationsStore.queryResult(query as SearchQueryParams)
            }

            this.query = query as SearchQueryParams
        } else if (query?.collections?.length) {
            this.searchViewStore.searchCollections = query.collections
        }

        if (this.sharedStore.navigation) {
            this.sharedStore.navigation.searchParams.replace(queryString)
        }
    }
}
