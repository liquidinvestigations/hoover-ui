import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    container: {
        backgroundColor: theme.palette.grey[100],
    },
}))
