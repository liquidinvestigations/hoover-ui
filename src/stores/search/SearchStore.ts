import { ParsedUrlQuery } from 'querystring'

import { makeAutoObservable, reaction, runInAction } from 'mobx'
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

    queuedQuery: ParsedUrlQuery | undefined = undefined

    constructor(private readonly sharedStore: SharedStore) {
        this.searchViewStore = new SearchViewStore(sharedStore, this)
        this.searchAggregationsStore = new SearchAggregationsStore(sharedStore, this)
        this.searchMissingStore = new SearchMissingStore(sharedStore, this)
        this.searchResultsStore = new SearchResultsStore(sharedStore, this)
        this.filtersStore = new FiltersStore(this)

        makeAutoObservable(this)
    }

    queueSearch = (query: ParsedUrlQuery): void => {
        if (query.q) {
            this.queuedQuery = query
        }
    }

    parseSearchParams = (search: string): Partial<SearchQueryParams> => {
        const parsedQuery = fixLegacyQuery(unwindParams(qs.parse(search, { arrayLimit: 100 })))

        parsedQuery.page = parseInt(parsedQuery.page)
        parsedQuery.size = parseInt(parsedQuery.size)

        this.searchViewStore.searchText = parsedQuery.q || ''
        this.searchViewStore.searchCollections = parsedQuery.collections || []
        this.sharedStore.excludedFields = parsedQuery.excludedFields || []

        return parsedQuery
    }

    search = (params: Partial<SearchQueryParams> = {}, options: SearchOptions = {}) => {
        const { searchText, searchCollections } = this.searchViewStore

        const { searchType, keepFromClearing, fieldList } = {
            ...{ searchType: SearchType.Aggregations | SearchType.Results },
            ...options,
        }

        if (searchType & SearchType.Results) {
            this.searchResultsStore.clearResults()
        }

        const mergedParams = {
            ...this.query,
            ...{ q: searchText, collections: searchCollections, excludedFields: this.sharedStore.excludedFields },
            ...defaultSearchParams,
            ...params,
        }

        const queryString = buildSearchQuerystring(mergedParams)
        const query = this.parseSearchParams(queryString)

        if (query.q && query.page && query.size && query.collections?.length) {
            if (searchType & SearchType.Aggregations) {
                this.searchAggregationsStore.performQuery(query as SearchQueryParams, keepFromClearing, fieldList)
            }

            if (searchType & SearchType.Missing) {
                this.searchMissingStore.performQuery(query as SearchQueryParams, fieldList)
            }

            if (searchType & SearchType.Results) {
                this.searchResultsStore.performQuery(query as SearchQueryParams)
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
