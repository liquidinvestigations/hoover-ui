import Map from '../src/components/maps/Map'
import { CoordinatesProvider } from '../src/components/maps/CoordinatesProvider'
import { GeoSearchProvider } from '../src/components/maps/GeoSearchProvider'
import GoogleMapsLink from '../src/components/maps/GoogleMapsLink'

export default function Maps() {
    return (
        <CoordinatesProvider>
            <GeoSearchProvider>
                <Map />
                <GoogleMapsLink />
            </GeoSearchProvider>
        </CoordinatesProvider>
    )
}
