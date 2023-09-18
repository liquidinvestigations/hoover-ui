import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { ChangeEvent, ReactNode, RefObject } from 'react'
import { Entry } from 'type-fest'

import { availableColumns } from '../../constants/availableColumns'
import { Category } from '../../Types'
import { SharedStore } from '../SharedStore'

import { SearchStore } from './SearchStore'

export type ResultsViewType = 'list' | 'table'

export class SearchViewStore {
    inputRef: RefObject<HTMLInputElement> | undefined = undefined

    drawerRef: HTMLDivElement | undefined = undefined

    drawerWidth: number | undefined

    categoryQuickFilter: Partial<Record<Category, string>> = {}

    openCategory: Category | undefined = 'collections'

    drawerPinned = true

    searchCollections: string[] = []

    searchText = ''

    searchFieldsOpen = false

    resultsViewType: ResultsViewType = 'list'

    resultsColumns = Object.entries(availableColumns).filter(([, { hidden }]) => !hidden)

    snackbarMessage: ReactNode | undefined

    constructor(private readonly sharedStore: SharedStore, private readonly searchStore: SearchStore) {
        makeAutoObservable(this)

        reaction(
            () => this.drawerRef,
            (drawerRef) => {
                this.drawerWidth = drawerRef?.getBoundingClientRect().width
            }
        )

        reaction(
            () => this.sharedStore.tagsStore.tagsRefreshQueue,
            (tagsRefreshQueue) => {
                if (tagsRefreshQueue) {
                    tagsRefreshQueue.promise
                        .then(() => {
                            this.setSnackbarMessage('Refresh for new tags')
                        })
                        .finally(() => {
                            this.sharedStore.tagsStore.setTagsRefreshQueue(undefined)
                        })
                }
            }
        )
    }

    setInputRef = (inputRef: RefObject<HTMLInputElement>) => {
        runInAction(() => {
            this.inputRef = inputRef
        })
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

        if (category) {
            this.searchStore.filtersStore.loadMissing(this.searchStore.filtersStore.categories[category]?.filters[0].field)
        }
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

        if (this.sharedStore.collectionsData) {
            this.setSearchCollections(this.sharedStore.collectionsData.map((c) => c.name).filter((name) => selection.has(name)))
        }

        this.searchStore.search()
    }

    handleAllSearchCollectionsToggle = () => {
        if (this.sharedStore.collectionsData?.length === this.searchCollections.length) {
            this.setSearchCollections([])
        } else if (this.sharedStore.collectionsData) {
            this.setSearchCollections(this.sharedStore.collectionsData.map((c) => c.name))
        }
        this.searchStore.search()
    }

    setSearchFieldsOpen = (searchFieldsOpen: boolean) => {
        runInAction(() => {
            this.searchFieldsOpen = searchFieldsOpen
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

    setSnackbarMessage = (snackbarMessage: ReactNode): void => {
        runInAction(() => {
            this.snackbarMessage = snackbarMessage
        })
    }

    handleSnackbarClose = (): void => {
        this.setSnackbarMessage(undefined)
    }
}
