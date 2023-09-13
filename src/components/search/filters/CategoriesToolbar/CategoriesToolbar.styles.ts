import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
    },

    searchFieldsButton: {
        marginLeft: 11,
        position: 'absolute',
    },

    collapseButton: {
        marginLeft: 'auto',
        marginRight: 11,
        backgroundColor: theme.palette.grey[100],

        '&:hover': {
            backgroundColor: theme.palette.grey[200],
        },
    },

    collapseIcon: {
        transition: theme.transitions.create('transform', {
            duration: theme.transitions.duration.shortest,
        }),
    },

    expanded: {
        transform: 'rotate(180deg)',
    },
}))
