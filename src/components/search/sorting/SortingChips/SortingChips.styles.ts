import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    icon: {
        transition: 'transform .2s ease-in-out',
    },
    iconDown: {
        transform: 'rotate(180deg)',
    },
    chips: {
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'flex-end',
        '& > *': {
            marginRight: theme.spacing(0.5),
            marginBottom: theme.spacing(0.5),
        },
    },
}))
