import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { ChangeEvent, useRef } from 'react'

import { Category } from '../../Types'
import { SharedStore } from '../SharedStore'

import { SearchStore } from './SearchStore'

export class SearchViewStore {
    readonly drawerRef = useRef<HTMLDivElement>()

    drawerWidth: number | undefined

    categoryQuickFilter: Partial<Record<Category, string>> = {}

    openCategory: Category | undefined = 'collections'

    drawerPinned: boolean = true

    searchCollections: Category[] = []

    searchText: string | undefined

    wideFilters: boolean = true

    constructor(private readonly sharedStore: SharedStore, private readonly searchStore: SearchStore) {
        makeAutoObservable(this)

        reaction(
            () => this.drawerRef?.current,
            (drawerPortal) => {
                this.drawerWidth = drawerPortal?.getBoundingClientRect().width
            }
        )
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
}
