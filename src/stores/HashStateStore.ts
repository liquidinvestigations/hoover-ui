import { makeAutoObservable, reaction, runInAction } from 'mobx'
import qs from 'qs'

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
}

export class HashStateStore {
    sharedStore: SharedStore

    hashState: HashState = {}

    constructor(sharedStore: SharedStore) {
        this.sharedStore = sharedStore

        makeAutoObservable(this)

        if (typeof window !== 'undefined') {
            const { hash } = this.sharedStore.navigation?.location

            if (hash) {
                setTimeout(() => {
                    runInAction(() => {
                        this.hashState = unwindParams(qs.parse(hash.substring(1)))
                    })
                })
            }

            reaction(
                () => this.sharedStore.navigation?.location.hash,
                (hashString) => {
                    this.hashState = unwindParams(qs.parse(hashString.substring(1)))
                },
            )
        }
    }

    setHashState = (params: Record<string, any>, pushHistory = true) => {
        runInAction(() => {
            this.hashState = { ...this.hashState, ...params }
        })

        const hash = qs.stringify(rollupParams(this.hashState))
        this.sharedStore.navigation?.merge({ pathname: window.location.pathname, hash }, !pushHistory)
    }
}
