import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    title: {
        fontWeight: '500',
    },
    expand: {
        marginLeft: theme.spacing(2),
        transform: 'rotate(90deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },

    expandOpen: {
        transform: 'rotate(0deg)',
    },

    histogramTitle: {
        padding: 0,
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },

    chartBox: {
        marginBottom: theme.spacing(1),
    },
}))
