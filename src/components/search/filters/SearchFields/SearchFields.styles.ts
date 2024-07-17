import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    root: {
        position: 'absolute',
        zIndex: 1,
        width: 0,
        bottom: 0,
        overflowX: 'hidden',
        overflowY: 'auto',
        backgroundColor: theme.palette.grey[100],
        transition: theme.transitions.create('width', {
            duration: theme.transitions.duration.shortest,
        }),

        top: 'calc(56px + 48px)',

        '@media (min-width: 0px) and (orientation: landscape)': {
            top: 'calc(48px + 48px)',
        },

        '@media (min-width: 600px)': {
            top: 'calc(64px + 48px)',
        },
    },

    open: {
        width: 209,
    },

    checkbox: {
        padding: 5,

        '&.MuiCheckbox-indeterminate': {
            color: 'red',
        },
    },

    label: {
        overflowX: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
    },
}))
