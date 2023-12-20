import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    error: {
        paddingTop: theme.spacing(3),
    },

    main: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },

    clear: {
        color: theme.palette.grey.A400,
    },

    help: {
        color: theme.palette.grey.A400,
    },

    noMaxWidth: {
        maxWidth: 'none',
    },

    info: {
        color: theme.palette.grey.A700,
    },

    close: {
        padding: theme.spacing(0.5),
    },
}))
