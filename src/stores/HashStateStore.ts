import qs from 'qs'
import { makeAutoObservable, reaction, runInAction } from 'mobx'
import { createObservableHistory, ObservableHistory } from 'mobx-observable-history'
import { rollupParams, unwindParams } from '../utils/queryUtils'

let navigation: ObservableHistory

if (typeof window !== 'undefined') {
    navigation = createObservableHistory()
}

export interface HashState {
    preview?: {
        c: string
        i: string
    }
    tab?: string
    subTab?: string
}

export class HashStateStore {
    hashState: HashState = {}

    constructor() {
        makeAutoObservable(this)

        if (typeof window !== 'undefined') {
            const { hash } = navigation.location

            if (hash) {
                runInAction(() => {
                    this.hashState = unwindParams(qs.parse(hash.substring(1)))
                })
            }

            reaction(
                () => navigation.location.hash,
                (hashString) => {
                    this.hashState = unwindParams(qs.parse(hashString.substring(1)))
                }
            )
        }
    }

    setHashState = (params: Record<string, string>, pushHistory = true) => {
        runInAction(() => {
            this.hashState = { ...this.hashState, ...params }
        })

        const hash = qs.stringify(rollupParams(this.hashState))
        navigation.merge({ hash }, !pushHistory)
    }
}
