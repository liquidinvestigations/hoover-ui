import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    preview: {
        height: '50vh',
        overflow: 'hidden',
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey[200],
    },
}))
