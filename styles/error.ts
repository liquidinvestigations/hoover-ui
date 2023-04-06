import { Theme } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    error: {
        color: '#000',
        background: '#fff',
        fontFamily: '-apple-system, BlinkMacSystemFont, Roboto, "Segoe UI", "Fira Sans", Avenir, "Helvetica Neue", "Lucida Grande", sans-serif',
        height: 'calc(100vh - 56px)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',

        '@media (min-width: 0px) and (orientation: landscape)': {
            height: 'calc(100vh - 48px)',
        },

        '@media (min-width: 600px)': {
            height: 'calc(100vh - 64px)',
        },
    },

    desc: {
        display: 'inline-block',
        textAlign: 'left',
        lineHeight: '49px',
        height: '49px',
        verticalAlign: 'middle',
        color: theme.palette.error.main,

        '& a': {
            color: theme.palette.error.main,
        },

        '& h2': {
            fontSize: '14px',
            fontWeight: 'normal',
            lineHeight: 'inherit',
            margin: 0,
            padding: 0,
        },
    },

    h1: {
        display: 'inline-block',
        borderRight: '1px solid rgba(0, 0, 0,.3)',
        margin: 0,
        marginRight: '20px',
        padding: '10px 23px 10px 0',
        fontSize: '24px',
        fontWeight: 500,
        verticalAlign: 'top',
    },
}))
