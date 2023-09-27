import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    container: {
        width: '90px',
        borderRight: '1px solid rgba(0, 0, 0, 0.2)',
        transition: theme.transitions.create('width', {
            duration: theme.transitions.duration.shortest,
        }),
        justifyContent: 'center'
    },
}))
