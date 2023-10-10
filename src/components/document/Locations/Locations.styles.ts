import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    error: {
        padding: theme.spacing(3),
        fontSize: '14px',

        '& a': {
            color: theme.palette.error.main,
        },
    },
    container: {
        paddingTop: theme.spacing(2),
    },
    title: {
        padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
    },
    list: {
        overflowY: 'auto',
        height: 'calc(100% - 40px)',
    },
}))
