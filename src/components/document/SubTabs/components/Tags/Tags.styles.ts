import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    error: {
        padding: theme.spacing(1),
        fontSize: '14px',

        '& a': {
            color: theme.palette.error.main,
        },
    },

    toolbarButtons: {
        marginBottom: theme.spacing(3),
    },

    toolbarButton: {
        textTransform: 'none',
    },

    buttons: {
        marginTop: theme.spacing(1),
    },

    help: {
        color: theme.palette.grey.A100,
    },

    noMaxWidth: {
        maxWidth: 'none',
    },

    otherTags: {
        paddingBottom: 0,
        borderBottom: '1px solid rgba(0, 0, 0, 0.42)',
    },

    otherTagsInfo: {
        marginTop: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },

    tag: {
        marginRight: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },

    option: {
        width: '100%',
        display: 'inline-flex',
        justifyContent: 'space-between',
    },

    optionCount: {
        color: theme.palette.grey[500],
    },
}))
