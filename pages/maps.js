import { CoordinatesProvider } from '../src/components/maps/CoordinatesProvider'
import { GeoSearchProvider } from '../src/components/maps/GeoSearchProvider'
import GoogleMapsLink from '../src/components/maps/GoogleMapsLink'
import Map from '../src/components/maps/Map'

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
