import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    printTitle: {
        margin: theme.spacing(2),
    },

    icon: {
        verticalAlign: 'bottom',
        marginRight: theme.spacing(1),
    },

    subTab: {
        height: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
    },


    searchCount: {
        position: 'absolute',
        top: theme.spacing(0.5),
        right: theme.spacing(0.5),

        '& > div': {
            padding: theme.spacing(0.5),
        },

        '& .totalCount': {
            padding: `${theme.spacing(0.25)} ${theme.spacing(1)}`,
            borderRadius: theme.spacing(1),
            color: theme.palette.common.white,
            fontSize: '12px',
            background: '#ff0000d9',
        },
    },
}))
