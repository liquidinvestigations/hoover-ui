import { makeAutoObservable, runInAction } from 'mobx'
import qs from 'qs'
import { ChangeEvent } from 'react'

import { SearchQueryParams } from '../../Types'
import fixLegacyQuery from '../../utils/fixLegacyQuery'
import { buildSearchQuerystring, defaultSearchTextParams, unwindParams } from '../../utils/queryUtils'
import { SharedStore } from '../SharedStore'

import { SearchResultsStore } from './SearchResultsStore'

export class SearchStore {
    searchText: string | undefined

    query: SearchQueryParams | undefined

    searchResultsStore: SearchResultsStore

    constructor(public readonly sharedStore: SharedStore) {
        this.searchResultsStore = new SearchResultsStore(this)

        makeAutoObservable(this)
    }

    parseSearchParams = (search: string): Partial<SearchQueryParams> => {
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

        if (query.q && query.page && query.size && query?.collections?.length) {
            if (this.searchResultsStore.queryDiffer(query as SearchQueryParams)) {
                this.query = query as SearchQueryParams
                this.searchResultsStore.queryResult(query as SearchQueryParams)
            }
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

    clearSearchText = () => {
        runInAction(() => {
            this.searchText = undefined
        })
    }
}
