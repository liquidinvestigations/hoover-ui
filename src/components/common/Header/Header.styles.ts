import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    root: {
        zIndex: theme.zIndex.drawer + 1,
    },

    flex: {
        flexGrow: 1,
        minWidth: 250,
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
    },

    noLink: {
        textDecoration: 'none',
        color: 'inherit',
    },
}))
