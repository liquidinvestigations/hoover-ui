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
        color: theme.palette.grey.A100,
    },

    help: {
        color: theme.palette.grey.A100,
    },

    noMaxWidth: {
        maxWidth: 'none',
    },

    info: {
        color: theme.palette.grey.A700,
    },

    sorting: {
        display: 'flex',
        marginTop: theme.spacing(2),
        justifyContent: 'flex-end',
    },
}))
