import qs from 'qs'
import { ChangeEvent } from 'react'
import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { SearchQueryParams } from '../../Types'
import { buildSearchQuerystring, defaultSearchTextParams, unwindParams } from '../../utils/queryUtils'
import { SharedStore } from '../SharedStore'
import { SearchResultsStore } from './SearchResultsStore'
import fixLegacyQuery from '../../utils/fixLegacyQuery'

export class SearchStore {
    searchText: string | undefined = undefined

    query: SearchQueryParams | undefined = {}

    sharedStore: SharedStore

    searchResultsStore: SearchResultsStore

    constructor(sharedStore: SharedStore) {
        this.sharedStore = sharedStore
        this.searchResultsStore = new SearchResultsStore(this)

        makeAutoObservable(this)
    }

    parseSearchParams = (search?: string): SearchQueryParams | undefined => {
        if (search) {
            const parsedQuery = fixLegacyQuery(unwindParams(qs.parse(search, { arrayLimit: 100 })))

            if (parsedQuery.q) {
                this.searchText = parsedQuery.q
            }

            return parsedQuery
        }
    }

    search = (params: SearchQueryParams) => {
        let mergedParams = { ...this.query, ...params }
        if (this.searchText) {
            mergedParams.q = this.searchText
            mergedParams = { ...defaultSearchTextParams, ...mergedParams }
        }

        const queryString = buildSearchQuerystring(mergedParams)
        const parsedQuery = this.parseSearchParams(queryString)
        if (parsedQuery?.collections?.length && this.searchResultsStore.resultsQueryDiffer(parsedQuery)) {
            this.query = parsedQuery
            this.searchResultsStore.runQueryTask()
        } else {
            this.query = parsedQuery
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
