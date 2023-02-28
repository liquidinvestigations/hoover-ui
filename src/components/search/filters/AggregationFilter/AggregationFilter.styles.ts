import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    checkbox: {
        padding: 5,
    },

    label: {
        overflowX: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },

    italic: {
        fontStyle: 'italic',
    },

    empty: {
        color: theme.palette.grey[500],
    },

    subLabel: {
        fontSize: '8.5pt',
    },

    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },

    right: {
        alignSelf: 'flex-end',
    },
}))
