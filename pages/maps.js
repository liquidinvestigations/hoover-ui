import React from 'react'
import Map from '../src/components/maps/Map'
import { GeoSearchProvider } from '../src/components/maps/GeoSearchProvider'

export default function Maps() {
    return (
        <GeoSearchProvider>
            <Map />
        </GeoSearchProvider>
    )
}
