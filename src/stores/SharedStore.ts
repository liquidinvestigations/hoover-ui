import { makeAutoObservable, reaction } from 'mobx'
import { createObservableHistory, ObservableHistory } from 'mobx-observable-history'

import { collections as collectionsAPI, limits as limitsAPI, searchFields, whoami } from '../backend/api'
import { SearchFields } from '../backend/buildSearchQuery'
import { Limits } from '../Types'

import { DocumentStore } from './DocumentStore'
import { HashStateStore } from './HashStateStore'
import { HotKeysStore } from './HotKeysStore'
import { MapsStore } from './MapsStore'
import { SearchStore } from './search/SearchStore'
import { TagsStore } from './TagsStore'

import type { CollectionData, User } from '../Types'

export class SharedStore {
    user: User | undefined

    collectionsData: CollectionData[] | undefined

    limits: Limits | undefined

    fields: SearchFields | undefined

    fullPage = false

    printMode = false

    navigation: ObservableHistory | undefined

    hashStore

    searchStore

    documentStore

    tagsStore

    hotKeysStore

    mapsStore

    constructor() {
        if (typeof window !== 'undefined') {
            this.navigation = createObservableHistory()
            void this.loadData()
        }

        this.hashStore = new HashStateStore(this)
        this.documentStore = new DocumentStore(this.hashStore)
        this.tagsStore = new TagsStore(this.documentStore)
        this.searchStore = new SearchStore(this)
        this.hotKeysStore = new HotKeysStore(this.hashStore, this.documentStore, this.searchStore)
        this.mapsStore = new MapsStore()

        makeAutoObservable(this)

        reaction(
            () => ({ fields: this.fields, user: this.user, queuedQuery: this.searchStore.queuedQuery }),
            ({ fields, user, queuedQuery }) => {
                if (fields !== undefined && user !== undefined && queuedQuery !== undefined) {
                    this.searchStore.search(queuedQuery)
                    this.searchStore.queuedQuery = undefined
                }
            }
        )
    }

    loadData = async () => {
        this.user = await whoami()
        this.collectionsData = await collectionsAPI()
        this.limits = await limitsAPI()

        const fields = await searchFields()
        this.fields = fields.fields
    }
}
