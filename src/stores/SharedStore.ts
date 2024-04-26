import { makeAutoObservable, runInAction } from 'mobx'

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

    excludedFields: string[] = []

    fullPage = false

    hashStore

    searchStore

    documentStore

    tagsStore

    hotKeysStore

    mapsStore

    constructor() {
        void this.loadData()

        this.hashStore = new HashStateStore(this)
        this.documentStore = new DocumentStore(this.hashStore)
        this.tagsStore = new TagsStore(this.documentStore)
        this.searchStore = new SearchStore(this)
        this.hotKeysStore = new HotKeysStore(this.hashStore, this.documentStore, this.searchStore)
        this.mapsStore = new MapsStore()

        makeAutoObservable(this)
    }

    loadData = async () => {
        const user = await whoami()
        const collectionsData = await collectionsAPI()
        const limits = await limitsAPI()
        const fields = await searchFields()

        runInAction(() => {
            this.user = user
            this.collectionsData = collectionsData
            this.limits = limits
            this.fields = fields.fields
        })
    }

    setFullPage = (fullPage: boolean) => {
        runInAction(() => {
            this.fullPage = fullPage
        })
    }
}
