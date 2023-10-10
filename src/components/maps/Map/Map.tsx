import mapLibreGL from 'maplibre-gl'
import { observer } from 'mobx-react-lite'
import { FC, useEffect } from 'react'

import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './Map.styles'

const Map: FC = observer(() => {
    const { classes } = useStyles()
    const { coordinates, setCoordinates } = useSharedStore().mapsStore

    useEffect(() => {
        if (mapLibreGL.getRTLTextPluginStatus() === 'unavailable') {
            mapLibreGL.setRTLTextPlugin('/api/map/mapbox-gl-rtl-text.js', () => {}, true)
        }

        const map = new mapLibreGL.Map({
            container: 'map',
            style: '/map-style.json',
            hash: true,
        })

        map.addControl(new mapLibreGL.NavigationControl({}))

        map.on('moveend', (event) => {
            const center = event.target.getCenter()
            setCoordinates({
                ...coordinates,
                latitude: center.lat,
                longitude: center.lng,
            })
        })

        map.on('zoomend', (event) => {
            setCoordinates({
                ...coordinates,
                zoom: event.target.getZoom(),
            })
        })
    }, [coordinates, setCoordinates])

    return <div id="map" className={classes.map} />
})

export default Map
