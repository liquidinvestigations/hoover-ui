import { Theme } from '@mui/material'
import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles((theme: Theme) => ({
    root: {
        width: '100%',
        overflow: 'hidden',
        position: 'absolute',
        height: 'calc(100vh - 56px)',

        '@media (min-width: 0px) and (orientation: landscape)': {
            height: 'calc(100vh - 48px)',
        },

        '@media (min-width: 600px)': {
            height: 'calc(100vh - 64px)',
        },
    },

    inner: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.palette.background.paper,
    },

    unpinned: {
        borderRight: '1px solid rgba(0, 0, 0, 0.2)',
    },

    title: {
        minHeight: 32,
        textTransform: 'uppercase',
        paddingTop: 6,
        paddingBottom: 6,
    },

    bold: {
        fontWeight: 'bold',
    },

    icon: {
        display: 'flex',
        alignSelf: 'center',
        marginRight: theme.spacing(2),
    },

    label: {
        marginRight: 'auto',
    },

    open: {
        display: 'flex',
        alignSelf: 'center',
        marginLeft: theme.spacing(1),
        [theme.breakpoints.up('sm')]: {
            marginRight: -8,
        },
    },

    openCollapsed: {
        borderRight: `3px solid ${theme.palette.grey[700]}`,
    },
}))
