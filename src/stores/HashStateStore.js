import qs from "qs"
import { makeAutoObservable, reaction } from "mobx"
import { rollupParams, unwindParams } from "../queryUtils"

export class HashStateStore {
    state = {}

    constructor () {
        makeAutoObservable(this)

        reaction(
            () => window?.location.hash,
            (hash => {
                this.state = unwindParams(qs.parse(hash.substring(1)))
            })
        )
    }

    setState = (params, pushHistory = true) => {
        this.state = {...this.state, ...params}
        const hash = qs.stringify(rollupParams(this.state))
        if (pushHistory) {
            location.hash = hash
        } else {
            history.replaceState(undefined, undefined, `#${hash}`)
        }
    }
}
