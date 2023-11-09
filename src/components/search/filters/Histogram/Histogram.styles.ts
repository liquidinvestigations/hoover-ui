import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    title: {
        fontWeight: '500',
    },
    expand: {
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
    },

    chartBox: {
        marginBottom: theme.spacing(1),
    },
}))
