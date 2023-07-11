import { makeAutoObservable } from 'mobx'
import { createObservableHistory, ObservableHistory } from 'mobx-observable-history'

import { Limits } from '../Types'

import { DocumentStore } from './DocumentStore'
import { HashStateStore } from './HashStateStore'
import { HotKeysStore } from './HotKeysStore'
import { MapsStore } from './MapsStore'
import { SearchStore } from './search/SearchStore'
import { TagsStore } from './TagsStore'

import type { CollectionData, User } from '../Types'

export class SharedStore {
    collectionsData: CollectionData[] = []

    limits: Limits | undefined = undefined

    fullPage = false

    printMode = false

    navigation: ObservableHistory | undefined

    hashStore

    searchStore

    documentStore

    tagsStore

    hotKeysStore

    mapsStore

    constructor(readonly user: User) {
        if (typeof window !== 'undefined') {
            this.navigation = createObservableHistory()
        }

        this.hashStore = new HashStateStore(this)
        this.documentStore = new DocumentStore(this.hashStore)
        this.tagsStore = new TagsStore(this.documentStore)
        this.searchStore = new SearchStore(this)
        this.hotKeysStore = new HotKeysStore(this.hashStore, this.documentStore, this.searchStore)
        this.mapsStore = new MapsStore()

        makeAutoObservable(this)
    }
}
