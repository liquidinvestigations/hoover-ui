import { makeAutoObservable, runInAction } from 'mobx'

interface Coordinates {
    latitude: number
    longitude: number
    zoom: number
}

export class MapsStore {
    coordinates: Coordinates = {
        latitude: 50.06676,
        longitude: 19.94633,
        zoom: 14.49,
    }

    results = []

    constructor() {
        makeAutoObservable(this)
    }

    setCoordinates = (coordinates: Coordinates) => {
        runInAction(() => {
            this.coordinates = coordinates
        })
    }

    setResults = (results: []) => {
        runInAction(() => {
            this.results = results
        })
    }
}
