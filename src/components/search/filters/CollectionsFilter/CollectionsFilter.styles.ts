import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
    noCollections: {
        padding: 10,
    },

    checkbox: {
        padding: 5,
    },

    label: {
        margin: 0,
    },

    progress: {
        fontSize: '7.5pt',
    },

    docCount: {
        flex: '1 0 auto',
        paddingLeft: 6,
        textAlign: 'right',
    },
}))
