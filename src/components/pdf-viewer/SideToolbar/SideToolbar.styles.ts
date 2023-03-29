import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    toolbar: {
        borderColor: theme.palette.grey[400],
        borderBottomStyle: 'solid',
        borderWidth: 1,
    },
    toolbarIcon: {
        marginRight: theme.spacing(2.3),
    },
}))
