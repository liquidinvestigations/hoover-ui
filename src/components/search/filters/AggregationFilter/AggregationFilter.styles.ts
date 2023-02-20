import { Theme } from '@mui/material'
import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles((theme: Theme) => ({
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

    docCount: {
        flex: '1 0 auto',
        paddingLeft: 6,
    },
}))
