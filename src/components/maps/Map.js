import React, { useEffect } from 'react'
import mapLibreGL from 'maplibre-gl'
import { makeStyles } from '@mui/styles'
import { useGeoSearch } from './GeoSearchProvider'
import { useCoordinates } from './CoordinatesProvider'

const useStyles = makeStyles(theme => ({
    map: {
        height: 'calc(100vh - 64px)',
    }
}))

export default function Map() {
    const classes = useStyles()
    const { results } = useGeoSearch()
    const { setCoordinates } = useCoordinates()

    useEffect(() => {
        if (mapLibreGL.getRTLTextPluginStatus() === 'unavailable') {
            mapLibreGL.setRTLTextPlugin(
                '/api/map/mapbox-gl-rtl-text.js',
                () => {},
                true
            )
        }
        const map = new mapLibreGL.Map({
            container: 'map',
            style: '/map-style.json',
            hash: true
        })

        map.addControl(new mapLibreGL.NavigationControl())

        map.on('moveend', event => {
            const center = event.target.getCenter()
            setCoordinates(coords => ({
                ...coords,
                latitude: center.lat,
                longitude: center.lng,
            }))
        })

        map.on('zoomend', event => {
            setCoordinates(coords => ({
                ...coords,
                zoom: event.target.getZoom(),
            }))
        })
    }, [])

    return (
        <div id="map" className={classes.map} />
    )
}
