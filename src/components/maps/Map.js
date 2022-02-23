import React, { useEffect } from 'react'
import mapLibreGL from 'maplibre-gl'
import { useGeoSearch } from './GeoSearchProvider'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
    map: {
        height: 'calc(100vh - 64px)',
    }
}))

export default function Map() {
    const classes = useStyles()
    const { results } = useGeoSearch()

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
    }, [])

    return (
        <div id="map" className={classes.map} />
    )
}
