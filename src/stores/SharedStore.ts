import { makeAutoObservable } from 'mobx'
import { createObservableHistory, ObservableHistory } from 'mobx-observable-history'

import { DocumentStore } from './DocumentStore'
import { HashStateStore } from './HashStateStore'
import { HotKeysStore } from './HotKeysStore'
import { SearchStore } from './search/SearchStore'

import type { CollectionData, User } from '../Types'

export class SharedStore {
    collectionsData: CollectionData[] = []

    limits = undefined

    fullPage = false

    printMode = false

    navigation: ObservableHistory | undefined

    user

    hashStore

    searchStore

    documentStore

    hotKeysStore

    constructor(user: User) {
        if (typeof window !== 'undefined') {
            this.navigation = createObservableHistory()
        }

        this.user = user
        this.hashStore = new HashStateStore(this)
        this.searchStore = new SearchStore(this)
        this.documentStore = new DocumentStore(this.hashStore)
        this.hotKeysStore = new HotKeysStore(this.hashStore, this.documentStore, this.searchStore)

        makeAutoObservable(this)
    }
}
