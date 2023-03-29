import { makeStyles } from 'tss-react/mui'

export const thumbnailWidth = 100

export const thumbnailHeight = 150

export const useStyles = makeStyles()(() => ({
    thumbnail: {
        float: 'left',
        margin: '0 10px 5px',
    },

    thumbnailSelection: {
        padding: 7,
        borderRadius: 2,
        width: `${thumbnailWidth}px`,
        height: `${thumbnailHeight}px`,

        '&$selected': {
            backgroundColor: 'rgba(0, 0, 0, 0.15)',
            backgroundClip: 'padding-box',
        },
    },

    selected: {},
}))
