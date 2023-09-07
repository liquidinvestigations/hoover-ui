import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',

        '& .total-count': {
            padding: `0 ${theme.spacing(1)}`,
            borderRadius: theme.spacing(1),
            color: theme.palette.common.white,
            fontSize: '12px',
            background: '#24abff', //'#ff0000d9',

            '&.no-results': {
                opacity: 0.5
            }
        },
    },

    header: {
        backgroundColor: theme.palette.primary.main,
    },

    titleWrapper: {
        overflow: 'hidden',
    },

    filename: {
        padding: theme.spacing(1),
        paddingBottom: 0,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        color: theme.palette.primary.contrastText,
    },

    subtitle: {
        padding: theme.spacing(1),
        paddingTop: theme.spacing(0.5),
        alignItems: 'baseline',
    },

    collection: {
        minHeight: 34,
        marginRight: theme.spacing(3),
        color: 'rgba(255,255,255,0.7)',
    },

    tag: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },

    thumbnail: {
        padding: theme.spacing(1),
        paddingBottom: 0,
    },

    thumbnailImg: {
        height: 72,
        maxWidth: 100,
    },

    tabsRoot: {
        minHeight: 65,
        color: theme.palette.primary.contrastText,
        backgroundColor: theme.palette.primary.main,
    },

    tabsIndicator: {
        top: 0,
    },

    activeTab: {
        height: '100%',
        overflow: 'auto',
    },

    printTitle: {
        margin: theme.spacing(2),
    },

    printBackLink: {
        position: 'absolute',
        top: theme.spacing(2),
        right: theme.spacing(2),
        color: theme.palette.primary.contrastText,
        zIndex: theme.zIndex.drawer + 2,
    },

    searchCount: {
        display: 'flex',
        flexFlow: 'column',
        alignItems: 'end',
        gap: theme.spacing(0.5),
        position: 'absolute',
        top: theme.spacing(0.5),
        right: theme.spacing(0.5),

        '& > div': {
            padding: theme.spacing(0.5),
        },

        '& .help': {
            padding: `${theme.spacing(0.25)} ${theme.spacing(1)}`,
            borderRadius: theme.spacing(1),
            color: theme.palette.common.white,
            fontSize: '12px',
            background: 'orange',
            width: 'fit-content',
        },
    },
}))
