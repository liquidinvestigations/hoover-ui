import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
    },

    search: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
    },

    searchInput: {
        fontSize: theme.typography.body2.fontSize,
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
    },

    searchInputStart: {
        paddingLeft: theme.spacing(1.3),
    },

    searchInputEnd: {
        paddingRight: theme.spacing(0.7),
    },

    searchIcon: {
        fontSize: 16,
    },

    pinButton: {
        marginLeft: 'auto',
        marginRight: 11,
    },

    pinIcon: {
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },

    unPinned: {
        transform: 'translateY(-3px) rotate(45deg) scale(0.85)',
    },
}))
