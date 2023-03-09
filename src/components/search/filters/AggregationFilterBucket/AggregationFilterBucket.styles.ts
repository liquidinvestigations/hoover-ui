import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
    checkbox: {
        padding: 5,
    },

    label: {
        overflowX: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },

    labelWithSub: {
        margin: 0,
    },

    subLabel: {
        fontSize: '8.5pt',
    },

    docCount: {
        flex: '1 0 auto',
        paddingLeft: 6,
        alignSelf: 'flex-end',
        textAlign: 'right',
    },
}))
