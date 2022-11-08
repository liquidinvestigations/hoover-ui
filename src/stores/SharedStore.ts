import { makeAutoObservable } from 'mobx'
import { User } from '../Types'
import { HashStateStore } from './HashStateStore'
import { DocumentStore } from './DocumentStore'

export class SharedStore {
    collections = []

    limits = null

    fullPage = false

    printMode = false

    serverQuery = null

    user

    hashStore

    documentStore

    constructor(user: User) {
        this.user = user
        this.hashStore = new HashStateStore()
        this.documentStore = new DocumentStore(this.hashStore)

        makeAutoObservable(this)
    }
}
