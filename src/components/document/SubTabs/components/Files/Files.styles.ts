import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    box: {
        overflowX: 'auto',
    },

    cell: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },

    link: {
        color: theme.palette.grey[600],
    },

    more: {
        padding: theme.spacing(1),
        borderBottom: 'none',
    },
}))
