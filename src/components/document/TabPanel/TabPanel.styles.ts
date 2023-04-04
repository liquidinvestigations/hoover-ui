import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
    root: {
        height: '100%',
    },

    tab: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
    },
}))
