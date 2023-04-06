import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
    progress: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
    },

    progressRoot: {
        height: 1,
    },
}))
