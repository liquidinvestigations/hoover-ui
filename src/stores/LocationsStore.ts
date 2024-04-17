import { makeAutoObservable, reaction } from 'mobx'
import { SyntheticEvent } from 'react'

import { locations as locationsAPI } from '../backend/api'
import { LocationData } from '../Types'

import { DocumentStore } from './DocumentStore'
import { Error } from './types'

export class LocationsStore {
    locations: LocationData[] = []
    error: Error | null = null
    page = 1
    hasNextPage = false
    loadingNextPage = false

    constructor(private readonly documentStore: DocumentStore) {
        makeAutoObservable(this)

        reaction(
            () => [this.page],
            () => this.documentStore.digestUrl && this.fetchLocations(),
        )
    }

    fetchLocations() {
        this.setError(null)
        locationsAPI(this.documentStore.digestUrl, this.page)
            .then((response) => {
                this.setLocations(response.locations)
                this.setHasNextPage(response.has_next_page)
            })
            .catch((res) => {
                this.setError({ status: res.status, statusText: res.statusText, url: res.url })
            })
    }

    private setError(value: Error | null) {
        this.error = value
    }

    private setPage(value: number) {
        this.page = value
    }

    private setHasNextPage(value: boolean) {
        this.hasNextPage = value
    }

    private setLoadingNextPage(value: boolean) {
        this.loadingNextPage = value
    }

    private setLocations(value: LocationData[]) {
        this.locations = value
    }

    async loadMore(event: SyntheticEvent) {
        event.preventDefault()
        this.setLoadingNextPage(true)
        const response = await locationsAPI(this.documentStore.digestUrl, this.page + 1)
        this.setPage(this.page + 1)
        this.setLocations([...this.locations, ...response.locations])
        this.setHasNextPage(response.has_next_page)
        this.setLoadingNextPage(false)
    }
}
