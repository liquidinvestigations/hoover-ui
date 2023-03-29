import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    container: {
        padding: theme.spacing(1),
        backgroundColor: theme.palette.grey[100],
    },
}))
