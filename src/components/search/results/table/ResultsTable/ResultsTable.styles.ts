import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    table: {
        '& th': {
            fontWeight: 'bold',
            whiteSpace: 'nowrap',
            '&.sortable': {
                cursor: 'pointer',
            },
        },

        '& td': {
            whiteSpace: 'nowrap',
            cursor: 'pointer',
        },

        '& tbody tr:hover': {
            backgroundColor: theme.palette.grey[100],
        },
    },

    icon: {
        fontSize: 20,
        verticalAlign: 'middle',
        marginLeft: theme.spacing(1),
        transition: 'transform .2s ease-in-out',
    },

    iconDown: {
        transform: 'rotate(180deg)',
    },
}))
