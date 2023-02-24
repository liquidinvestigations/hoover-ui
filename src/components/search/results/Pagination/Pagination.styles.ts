import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    pageLink: {
        cursor: 'pointer',
        margin: theme.spacing(1),

        '&:hover': {
            textDecoration: 'underline',
        },
    },

    pageLinkCurrent: {
        cursor: 'default',
        fontWeight: 'bold',
        textDecoration: 'underline',
    },
}))
