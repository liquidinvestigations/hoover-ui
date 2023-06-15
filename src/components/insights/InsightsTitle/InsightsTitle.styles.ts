import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    collectionTitle: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
}))
