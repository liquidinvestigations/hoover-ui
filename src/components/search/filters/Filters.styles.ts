import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    error: {
        padding: theme.spacing(2),
    },

    loading: {
        top: 4,
        right: 4,
        position: 'absolute',
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },
}))
