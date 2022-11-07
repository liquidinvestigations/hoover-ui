import qs from 'qs'
import { autorun, makeAutoObservable, reaction, runInAction } from 'mobx'
import { createObservableHistory } from 'mobx-observable-history'
import { rollupParams, unwindParams } from '../queryUtils'

let navigation

if (typeof window !== 'undefined') {
    navigation = createObservableHistory()
}

export class HashStateStore {
    hashState = {}

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

    setHashState = (params, pushHistory = true) => {
        runInAction(() => {
            this.hashState = { ...this.hashState, ...params }
        })

        const hash = qs.stringify(rollupParams(this.hashState))
        navigation.merge({ hash }, !pushHistory)
    }
}
