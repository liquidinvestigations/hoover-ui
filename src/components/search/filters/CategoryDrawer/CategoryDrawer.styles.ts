import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
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
        textTransform: 'uppercase',
    },

    bold: {
        fontWeight: 'bold',
    },

    listItem: {
        display: 'flex',
        flexFlow: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing(1),

        '&': {
            'svg': {
                marginBottom: theme.spacing(0.5)
            }
        },
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
        boxShadow: `inset -2px 0 0 0  ${theme.palette.grey[700]}`,
        backgroundColor: theme.palette.grey[100]
    },
}))
