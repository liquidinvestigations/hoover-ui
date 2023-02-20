import { makeAutoObservable, runInAction } from 'mobx'
import qs from 'qs'
import { ChangeEvent } from 'react'

import { Category, SearchQueryParams } from '../../Types'
import fixLegacyQuery from '../../utils/fixLegacyQuery'
import { buildSearchQuerystring, defaultSearchTextParams, unwindParams } from '../../utils/queryUtils'
import { SharedStore } from '../SharedStore'

import { SearchResultsStore } from './SearchResultsStore'

export class SearchStore {
    categoryQuickFilter: Partial<Record<Category, string>> = {}

    openCategory: Category | undefined = 'collections'

    drawerPinned: boolean = true

    searchCollections: Category[] = []

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

        if (parsedQuery.collections) {
            this.searchCollections = parsedQuery.collections
        }

        return parsedQuery
    }

    search = (params?: Partial<SearchQueryParams>) => {
        let mergedParams = { ...this.query, ...(params || {}) }

        if (this.searchText) {
            mergedParams.q = this.searchText
        }

        if (this.searchCollections) {
            mergedParams.collections = this.searchCollections
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
            this.searchCollections = query.collections
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

    setCategoryQuickFilter = (category: Category, filter: string) => {
        runInAction(() => {
            this.categoryQuickFilter[category] = filter
        })
    }

    setOpenCategory = (category: Category | undefined) => {
        runInAction(() => {
            this.openCategory = category
        })
    }

    setDrawerPinned = (drawerPinned: boolean) => {
        runInAction(() => {
            this.drawerPinned = drawerPinned
        })
    }

    setSearchCollections = (searchCollections: Category[]) => {
        runInAction(() => {
            this.searchCollections = searchCollections
        })
    }

    handleSearchCollectionsChange = (name: Category) => () => {
        const selection = new Set(this.searchCollections || [])

        if (selection.has(name)) {
            selection.delete(name)
        } else {
            selection.add(name)
        }

        this.setSearchCollections(this.sharedStore.collectionsData.map((c) => c.name).filter((name) => selection.has(name)))
        this.search()
    }

    handleAllSearchCollectionsToggle = () => {
        if (this.sharedStore.collectionsData.length === this.setSearchCollections.length) {
            this.setSearchCollections([])
        } else {
            this.setSearchCollections(this.sharedStore.collectionsData.map((c) => c.name))
        }
        this.search()
    }
}
