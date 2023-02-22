import { makeAutoObservable } from 'mobx'

export class SearchAggregationsStore {
    constructor() {
        makeAutoObservable(this)
    }
}
