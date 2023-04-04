import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { ChangeEvent, useRef } from 'react'
import { Entry } from 'type-fest'

import { availableColumns } from '../../constants/availableColumns'
import { Category } from '../../Types'
import { SharedStore } from '../SharedStore'

import { SearchStore } from './SearchStore'

export type ResultsViewType = 'list' | 'table'

export class SearchViewStore {
    readonly inputRef = useRef<HTMLInputElement>()

    drawerRef: HTMLDivElement | undefined = undefined

    drawerWidth: number | undefined

    categoryQuickFilter: Partial<Record<Category, string>> = {}

    openCategory: Category | undefined = 'collections'

    drawerPinned: boolean = true

    searchCollections: string[] = []

    searchText: string = ''

    wideFilters: boolean = true

    resultsViewType: ResultsViewType = 'list'

    resultsColumns = Object.entries(availableColumns).filter(([, { hidden }]) => !hidden)

    constructor(private readonly sharedStore: SharedStore, private readonly searchStore: SearchStore) {
        makeAutoObservable(this)

        reaction(
            () => this.drawerRef,
            (drawerRef) => {
                this.drawerWidth = drawerRef?.getBoundingClientRect().width
            }
        )
    }

    setDrawerRef = (drawerRef: HTMLDivElement) => {
        runInAction(() => {
            this.drawerRef = drawerRef
        })
    }

    setDrawerWidth = (width: number) => {
        runInAction(() => {
            this.drawerWidth = width
        })
    }

    handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        runInAction(() => {
            this.searchText = event.target.value
        })
    }

    clearSearchText = () => {
        runInAction(() => {
            this.searchText = ''
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
        this.searchStore.search()
    }

    handleAllSearchCollectionsToggle = () => {
        if (this.sharedStore.collectionsData.length === this.setSearchCollections.length) {
            this.setSearchCollections([])
        } else {
            this.setSearchCollections(this.sharedStore.collectionsData.map((c) => c.name))
        }
        this.searchStore.search()
    }

    setWideFilters = (wideFilters: boolean) => {
        runInAction(() => {
            this.wideFilters = wideFilters
        })
    }

    setResultsViewType = (resultsViewType: ResultsViewType) => {
        runInAction(() => {
            this.resultsViewType = resultsViewType
        })
    }

    setResultsColumns = (resultsColumns: Entry<typeof availableColumns>[]) => {
        runInAction(() => {
            this.resultsColumns = resultsColumns
        })
    }
}
