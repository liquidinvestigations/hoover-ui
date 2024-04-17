import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    left: {
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },

    middle: {
        backgroundColor: theme.palette.background.default,
        minWidth: 0, // So the Typography noWrap works
        overflowX: 'hidden',
        overflowY: 'auto',
        height: 'auto',
    },

    right: {
        overflow: 'hidden',
    },

    container: {
        overflow: 'hidden',
        height: 'calc(100vh - 48px)',
        position: 'relative',
        backfaceVisibility: 'hidden',
        willChange: 'overflow',
    },
}))
