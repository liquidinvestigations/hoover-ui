import { makeAutoObservable, runInAction } from 'mobx'
import qs from 'qs'

import { router } from '../../index'
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
    searchType?: number
    fieldList?: SourceField[] | '*'
    keepFromClearing?: AggregationsKey
}

export class SearchStore {
    query: SearchQueryParams | undefined

    options: SearchOptions | undefined

    filtersStore: FiltersStore

    searchViewStore: SearchViewStore

    searchAggregationsStore: SearchAggregationsStore

    searchMissingStore: SearchMissingStore

    searchResultsStore: SearchResultsStore

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

    parseSearchParams = (search: string) => {
        const parsedQuery = fixLegacyQuery(unwindParams(qs.parse(search, { arrayLimit: 100 }))) as SearchQueryParams

        parsedQuery.page = parseInt(parsedQuery.page as unknown as string)
        parsedQuery.size = parseInt(parsedQuery.size as unknown as string)

        this.searchViewStore.searchText = (parsedQuery.q as string) || ''
        this.searchViewStore.searchCollections = (parsedQuery.collections as string[]) || []
        this.sharedStore.excludedFields = (parsedQuery.excludedFields as string[]) || []

        if (parsedQuery?.collections?.length) {
            this.searchViewStore.searchCollections = parsedQuery.collections
        }

        this.query = parsedQuery
    }

    navigateSearch = (params: Partial<SearchQueryParams> = {}, options?: SearchOptions) => {
        const mergedParams = this.getMergedParams(params)
        const queryString = buildSearchQuerystring(mergedParams)

        this.options = options

        void router.navigate('?' + queryString + window.location.hash)
    }

    performSearch = (options?: SearchOptions) => {
        const { searchType, keepFromClearing, fieldList } = {
            ...{ searchType: SearchType.Aggregations | SearchType.Results },
            ...(options || this.options || {}),
        }

        if (searchType & SearchType.Results) {
            this.searchResultsStore.clearResults()
        }

        if (this.query?.q && this.query.page && this.query.size && this.query.collections?.length) {
            this.performQueriesBasedOnType(this.query as SearchQueryParams, searchType, keepFromClearing, fieldList as SourceField[])
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
            this.navigateSearch()
        }
    }
}
