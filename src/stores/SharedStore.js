import { makeAutoObservable } from 'mobx'
import { HashStateStore } from './HashStateStore'
import { DocumentStore } from './DocumentStore'

export class SharedStore {
    user = null

    collections = []

    limits = null

    fullPage = false

    printMode = false

    serverQuery = null

    hashStore = null

    documentStore = null

    constructor({ user }) {
        this.user = user
        this.hashStore = new HashStateStore()
        this.documentStore = new DocumentStore(this.hashStore)

        makeAutoObservable(this)
    }
}
