import qs from 'qs'
import { ChangeEvent } from 'react'
import { makeAutoObservable, runInAction } from 'mobx'
import { SearchQueryParams } from '../../Types'
import { buildSearchQuerystring, defaultSearchTextParams, unwindParams } from '../../utils/queryUtils'
import { SharedStore } from '../SharedStore'
import { SearchResultsStore } from './SearchResultsStore'
import fixLegacyQuery from '../../utils/fixLegacyQuery'

export class SearchStore {
    searchText: string | undefined

    query: SearchQueryParams | undefined

    searchResultsStore: SearchResultsStore

    constructor(public readonly sharedStore: SharedStore) {
        this.searchResultsStore = new SearchResultsStore(this)

        makeAutoObservable(this)
    }

    parseSearchParams = (search: string): SearchQueryParams => {
        const parsedQuery = fixLegacyQuery(unwindParams(qs.parse(search, { arrayLimit: 100 })))

        if (parsedQuery.q) {
            this.searchText = parsedQuery.q
        }

        return parsedQuery
    }

    search = (params: Partial<SearchQueryParams>) => {
        let mergedParams = { ...this.query, ...params }
        if (this.searchText) {
            mergedParams.q = this.searchText
            mergedParams = { ...defaultSearchTextParams, ...mergedParams }
        }

        const queryString = buildSearchQuerystring(mergedParams)
        const query = this.parseSearchParams(queryString)

        if (query?.collections?.length && this.searchResultsStore.queryDiffer(query)) {
            this.query = query
            this.searchResultsStore.queryResult(query)
        }

        if (this.sharedStore.navigation) {
            this.sharedStore.navigation.searchParams.replace(queryString)
        }
    }

    handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        runInAction(() => {
            this.searchText = event.target.value
        })
    }
}
