import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    main: {
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
    },
    rateLimit: {
        color: '#888',
        fontSize: '14px',
        paddingTop: theme.spacing(2),
        paddingBottom: theme.spacing(2),
    },
}))
