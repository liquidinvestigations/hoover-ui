import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
    thumbnailImage: {
        opacity: 0.8,
        border: '1px solid rgba(0, 0, 0, 0)',
        boxShadow: '0 0 0 1px rgb(0 0 0 / 50%), 0 2px 8px rgb(0 0 0 / 30%)',
        backgroundColor: '#fff',
        backgroundClip: 'content-box',
        boxSizing: 'border-box',
    },
}))
