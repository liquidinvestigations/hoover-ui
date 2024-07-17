import { makeAutoObservable, runInAction } from 'mobx'
import qs from 'qs'

import { router } from '../index'
import { rollupParams, unwindParams } from '../utils/queryUtils'

import { SharedStore } from './SharedStore'

export interface HashState {
    preview?: {
        c: string
        i: string
    }
    tab?: string
    subTab?: string
    chunkTab?: string
    previewPage?: string
    histogram?: Record<string, boolean>
    findQuery?: string
    findIndex?: string
    date?: boolean
    collections?: string
    dedup_results?: number
}

export class HashStateStore {
    sharedStore: SharedStore

    hashState: HashState = {}

    constructor(sharedStore: SharedStore) {
        this.sharedStore = sharedStore

        makeAutoObservable(this)
    }

    parseHashState = (hashString: string) => {
        runInAction(() => {
            this.hashState = unwindParams(qs.parse(hashString.substring(1)))
        })
    }

    setHashState = (params: Record<string, unknown>, replace = false) => {
        runInAction(() => {
            this.hashState = { ...this.hashState, ...params }
        })

        const search = window.location.search
        const hash = qs.stringify(rollupParams(this.hashState))

        const path = search + '#' + hash
        void router.navigate(path, { replace })
    }
}
