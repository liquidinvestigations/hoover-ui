import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    root: {
        zIndex: theme.zIndex.drawer + 1,
    },

    flex: {
        flexGrow: 1,
    },

    noLink: {
        textDecoration: 'none',
        color: 'inherit',
    },
}))
