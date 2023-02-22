import { Theme } from '@mui/material'
import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles((theme: Theme) => ({
    error: {
        padding: theme.spacing(2),
    },

    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },
}))
