import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    error: {
        padding: theme.spacing(3),
    },

    viewer: {
        '&:fullscreen': {
            '& $container': {
                height: 'calc(100vh - 48px)',
            },
            '& $fullscreen': {
                display: 'none',
            },
            '& $fullscreenExit': {
                display: 'inline-flex',
            },
        },
    },

    fullscreen: {},

    fullscreenExit: {
        display: 'none',
    },

    container: {
        height: '50vh',
        overflow: 'auto',
        position: 'relative',
        boxSizing: 'content-box',
        backgroundColor: theme.palette.grey[200],

        '& .page': {
            marginBottom: theme.spacing(1),

            '& .svgLayer': {
                position: 'absolute',
                top: 0,
                left: 0,
            },
        },
    },

    externalLinks: {
        overflow: 'auto',

        '& th': {
            whiteSpace: 'nowrap',
            fontWeight: 'bold',
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },

        '& td': {
            whiteSpace: 'nowrap',
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },

        '& pre': {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginTop: theme.spacing(0.5),
            marginBottom: theme.spacing(0.5),
        },
    },

    externalLinksTitle: {
        padding: theme.spacing(2),
    },

    icon: {
        verticalAlign: 'bottom',
        marginRight: theme.spacing(1),
    },

    sidebar: {
        height: '100%',
    },

    sidebarContent: {
        overflowY: 'auto',
        height: 'calc(100% - 48px)',
    },
}))
