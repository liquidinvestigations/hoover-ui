import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    error: {
        padding: theme.spacing(2),
    },

    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },
}))
