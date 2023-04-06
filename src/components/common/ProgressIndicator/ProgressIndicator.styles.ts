import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    linear: {
        position: 'fixed',
        top: 0,
        height: 5,
        width: '100%',
        zIndex: theme.zIndex.appBar + 1,
    },

    circular: {
        position: 'fixed',
        top: theme.spacing(1),
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
    },
}))
