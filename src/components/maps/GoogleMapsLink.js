import { makeStyles } from "@material-ui/core/styles"
import { useCoordinates } from "./CoordinatesProvider"

const useStyles = makeStyles(theme => ({
    link: {
        position: "absolute",
        top: 100,
        left: 10
    }
}))

export default function GoogleMapsLink() {
    const classes = useStyles()
    const { coordinates } = useCoordinates()
    const { latitude, longitude, zoom } = coordinates
    const url = `https://www.google.com/maps/@${latitude?.toFixed(7)},${longitude?.toFixed(7)},${zoom?.toFixed(2)}z`

    return (
        <a href={url} target="_blank" className={classes.link} title="Open current location in Google Maps">
            <img src="/Gnome-fs-map.svg" alt="Google Maps" />
        </a>
    )
}
