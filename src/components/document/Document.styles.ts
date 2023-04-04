import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
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
}))
