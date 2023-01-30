import { makeAutoObservable } from 'mobx'
import { createObservableHistory, ObservableHistory } from 'mobx-observable-history'
import { CollectionData, User } from '../Types'
import { HashStateStore } from './HashStateStore'
import { DocumentStore } from './DocumentStore'
import { SearchStore } from './search/SearchStore'

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

    constructor(user: User) {
        if (typeof window !== 'undefined') {
            this.navigation = createObservableHistory()
        }

        this.user = user
        this.hashStore = new HashStateStore(this)
        this.searchStore = new SearchStore(this)
        this.documentStore = new DocumentStore(this.hashStore)

        makeAutoObservable(this)
    }
}
