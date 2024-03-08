import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    infoIcon: {
        fontSize: 20,
        verticalAlign: 'middle',
        color: theme.palette.grey[500],
        marginRight: theme.spacing(0.5),
    },

    preview: {
        padding: theme.spacing(1),
    },

    previewImg: {
        width: 400,
    },

    previewImgLoading: {
        width: 1,
    },
}))
