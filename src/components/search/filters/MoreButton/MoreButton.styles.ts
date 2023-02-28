import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },
}))
