import { useSharedStore } from '../../SharedStoreProvider'

import { useStyles } from './GoogleMapsLink.styles'

export default function GoogleMapsLink() {
    const { classes } = useStyles()
    const { coordinates } = useSharedStore().mapsStore
    const { latitude, longitude, zoom } = coordinates
    const url = `https://www.google.com/maps/@${latitude?.toFixed(7)},${longitude?.toFixed(7)},${zoom?.toFixed(2)}z`

    return (
        <a href={url} target="_blank" rel="noreferrer" className={classes.link} title="Open current location in Google Maps">
            <img src="/Gnome-fs-map.svg" alt="Google Maps" />
        </a>
    )
}
