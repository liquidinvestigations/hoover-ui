import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    selected: {
        boxShadow: `inset 0 0 0 2px ${theme.palette.secondary.main}`,

        '& td': {
            borderBottomColor: theme.palette.secondary.main,
        },
    },

    infoIcon: {
        fontSize: 20,
        verticalAlign: 'middle',
        color: theme.palette.grey[500],
        marginRight: theme.spacing(0.5),
    },

    actionIcon: {
        fontSize: 20,
        color: theme.palette.grey[600],
    },

    buttonLink: {
        lineHeight: 0,
    },

    tagIcon: {
        fontSize: 16,
        verticalAlign: 'middle',
        marginRight: theme.spacing(0.5),
    },

    duplicate: {
        opacity: 0.5,
    },
}))
