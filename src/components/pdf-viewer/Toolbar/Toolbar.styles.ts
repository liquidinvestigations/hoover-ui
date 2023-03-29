import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    toolbar: {
        backgroundColor: theme.palette.grey[100],
        borderColor: theme.palette.grey[400],
        borderWidth: 1,
        borderTopStyle: 'solid',
        borderBottomStyle: 'solid',
        justifyContent: 'space-between',
    },

    toolbarIcon: {
        marginRight: theme.spacing(1),
    },

    pageInfo: {
        display: 'inline-flex',
        alignItems: 'center',

        '& span': {
            marginLeft: theme.spacing(0.5),
        },
    },

    pageNumber: {
        width: 60,
        backgroundColor: theme.palette.background.default,

        '& .MuiOutlinedInput-inputMarginDense': {
            textAlign: 'right',
            padding: '5px 8px',
        },

        '& .MuiOutlinedInput-input': {
            padding: '5.5px 14px',
        },
    },

    scaleSelect: {
        width: 80,
        paddingRight: 4,
        cursor: 'pointer',
        border: '1px solid rgba(0, 0, 0, 0.23)',
        backgroundColor: theme.palette.background.default,
        display: 'flex',
        alignItems: 'center',

        '&:hover': {
            border: '1px solid rgba(0, 0, 0, 0.87)',
        },

        '& .MuiOutlinedInput-input': {
            width: 50,
            textAlign: 'right',
            display: 'inline-block',
            padding: '5px 0 5px 8px',
        },
    },
}))
