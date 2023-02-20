import { Theme } from '@mui/material'
import { makeStyles } from '@mui/styles'

export const useStyles = makeStyles((theme: Theme) => ({
    container: {
        width: 55,
        borderRight: '1px solid rgba(0, 0, 0, 0.2)',
        transition: theme.transitions.create('width', {
            duration: theme.transitions.duration.shortest,
        }),
    },

    wide: {
        width: 210,
    },
}))
