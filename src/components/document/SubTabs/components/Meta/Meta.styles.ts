import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    icon: {
        transform: 'rotate(-90deg)',
    },

    raw: {
        fontFamily: 'monospace',
        fontSize: '12px',
    },

    rawIcon: {
        fontSize: '1rem',
        transform: 'rotate(-90deg)',
    },

    searchField: {
        cursor: 'pointer',
        borderBottom: '1px dotted ' + theme.palette.grey[400],
    },

    score: {
        color: theme.palette.grey[500],
    },
}))
