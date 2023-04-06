import { NextPage } from 'next'

import Map from '../src/components/maps/Dynamic'
import GoogleMapsLink from '../src/components/maps/GoogleMapsLink/GoogleMapsLink'

const MapsPage: NextPage = () => {
    return (
        <>
            <Map />
            <GoogleMapsLink />
        </>
    )
}

export default MapsPage
