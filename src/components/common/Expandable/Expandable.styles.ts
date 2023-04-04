import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    title: {
        minHeight: 32,
        textTransform: 'uppercase',
        paddingTop: 6,
        paddingBottom: 6,
    },

    expand: {
        transform: 'rotate(0deg)',
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
        marginLeft: 'auto',

        [theme.breakpoints.up('sm')]: {
            marginRight: -8,
        },
    },

    expandOpen: {
        transform: 'rotate(180deg)',
    },

    header: {
        backgroundColor: theme.palette.grey[100],

        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },

    loading: {
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
    },

    content: {
        maxHeight: 435,
        overflow: 'auto',
    },

    fullHeightCollapseEntered: {
        overflow: 'auto',
    },

    fullHeightContent: {
        height: '100%',
        maxHeight: 'none',
        overflow: 'hidden',
    },
}))
