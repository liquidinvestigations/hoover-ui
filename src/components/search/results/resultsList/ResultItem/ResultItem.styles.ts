import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    card: {
        cursor: 'pointer',
        position: 'relative',
        marginTop: theme.spacing(1),
        borderLeft: '3px solid transparent',
        transition: theme.transitions.create('border', {
            duration: theme.transitions.duration.short,
        }),
    },

    cardContentRoot: {
        '&:last-child': {
            paddingBottom: 32,
        },
    },

    cardHeaderAction: {
        left: 16,
        bottom: 4,
        position: 'absolute',
    },

    cardHeaderContent: {
        width: '100%',
    },

    headerText: {
        overflow: 'hidden',
    },

    title: {
        fontSize: '1.4rem',
        display: 'block',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },

    index: {
        color: theme.palette.grey[500],
    },

    selected: {
        border: `2px solid ${theme.palette.secondary.main}`,
    },

    spaceBottom: {
        marginBottom: theme.spacing(1),
    },

    spaceTop: {
        marginTop: theme.spacing(1),
    },

    path: {
        marginTop: theme.spacing(2),
    },

    key: {
        whiteSpace: 'nowrap',
        fontWeight: 'bold',
    },

    text: {
        cursor: 'text',
        fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        fontSize: '.7rem',
        color: '#555',
    },

    actionIcon: {
        fontSize: 20,
        color: theme.palette.grey[600],
    },

    infoBox: {
        display: 'inline-flex',
        alignItems: 'center',
    },

    infoIcon: {
        fontSize: 20,
        color: theme.palette.grey[600],
        marginRight: theme.spacing(0.3),
    },

    collection: {
        fontSize: 16,
        color: theme.palette.grey[600],
        display: 'inline-flex',
        alignItems: 'center',
    },

    textField: {
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'inline-block',
    },

    buttonLink: {
        lineHeight: 0,
    },

    thumbnail: {
        padding: theme.spacing(1),
        paddingBottom: 0,
    },

    thumbnailImg: {
        height: 72,
        maxWidth: 100,
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

    duplicate: {
        opacity: 0.5,
    },
}))
