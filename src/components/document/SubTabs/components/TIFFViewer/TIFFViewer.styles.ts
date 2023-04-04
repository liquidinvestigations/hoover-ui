import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    wrapper: {
        textAlign: 'center',
        paddingTop: theme.spacing(2),
        backgroundColor: theme.palette.grey[200],

        '& img': {
            maxWidth: '95%',
            boxShadow: '0 2px 10px 0 black',
            marginBottom: theme.spacing(2),
        },
    },
}))
