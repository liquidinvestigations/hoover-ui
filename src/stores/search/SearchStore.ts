import { makeAutoObservable } from 'mobx'
import qs from 'qs'

import { SearchQueryParams } from '../../Types'
import fixLegacyQuery from '../../utils/fixLegacyQuery'
import { buildSearchQuerystring, defaultSearchTextParams, unwindParams } from '../../utils/queryUtils'
import { SharedStore } from '../SharedStore'

import { FiltersStore } from './FiltersStore'
import { SearchResultsStore } from './SearchResultsStore'
import { SearchViewStore } from './SearchViewStore'

export class SearchStore {
    query: SearchQueryParams | undefined

    filtersStore: FiltersStore

    searchViewStore: SearchViewStore

    searchResultsStore: SearchResultsStore

    constructor(private readonly sharedStore: SharedStore) {
        this.filtersStore = new FiltersStore(this)
        this.searchViewStore = new SearchViewStore(sharedStore, this)
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

    search = (params?: Partial<SearchQueryParams>) => {
        let mergedParams = { ...this.query, ...(params || {}) }

        if (this.searchViewStore.searchText) {
            mergedParams.q = this.searchViewStore.searchText
        }

        if (this.searchViewStore.searchCollections) {
            mergedParams.collections = this.searchViewStore.searchCollections
        }

        mergedParams = { ...defaultSearchTextParams, ...mergedParams }

        const queryString = buildSearchQuerystring(mergedParams)
        const query = this.parseSearchParams(queryString)

        if (query.q && query.page && query.size && query?.collections?.length) {
            if (this.searchResultsStore.queryDiffer(query as SearchQueryParams)) {
                this.query = query as SearchQueryParams
                this.searchResultsStore.queryResult(query as SearchQueryParams)
            }
        } else if (query?.collections?.length) {
            this.searchViewStore.searchCollections = query.collections
        }

        if (this.sharedStore.navigation) {
            this.sharedStore.navigation.searchParams.replace(queryString)
        }
    }
}
