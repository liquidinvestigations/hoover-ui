import qs from "qs"
import { autorun, makeAutoObservable, reaction } from "mobx"
import { createObservableHistory } from "mobx-observable-history"
import { rollupParams, unwindParams } from "../queryUtils"

let navigation

if (typeof window !== "undefined") {
    navigation = createObservableHistory()
}

export class HashStateStore {
    hashState = {}

    constructor () {
        makeAutoObservable(this)

        if (typeof window !== "undefined") {
            autorun(() => {
                const { hash } = navigation.location

                if (hash) {
                    this.hashState = unwindParams(qs.parse(hash.substring(1)))
                }
            })

            reaction(
                () => navigation.location.hash,
                (hash => {
                    this.hashState = unwindParams(qs.parse(hash.substring(1)))
                })
            )
        }
    }

    setHashState = (params, pushHistory = true) => {
        this.hashState = {...this.hashState, ...params}
        const hash = qs.stringify(rollupParams(this.hashState))
        navigation.merge({ hash }, !pushHistory)
    }
}
