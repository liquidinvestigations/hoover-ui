import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    bucket: {
        '&:hover': {
            backgroundColor: theme.palette.grey[100],
        },
    },
}))
