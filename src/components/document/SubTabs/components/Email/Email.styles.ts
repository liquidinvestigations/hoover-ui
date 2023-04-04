import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    preWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        whiteSpace: 'pre-wrap',
    },

    icon: {
        transform: 'rotate(-90deg)',
    },

    searchField: {
        cursor: 'pointer',
        borderBottom: '1px dotted ' + theme.palette.grey[400],
    },
}))
