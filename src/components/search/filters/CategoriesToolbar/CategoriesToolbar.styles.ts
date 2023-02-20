import { Theme } from '@mui/material'
import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles((theme: Theme) => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderBottomColor: theme.palette.grey[400],
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
    },
    collapseButton: {
        marginLeft: 'auto',
        marginRight: 11,
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
