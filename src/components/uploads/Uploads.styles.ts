import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
    },
    list: {
        maxWidth: 1200,
        margin: '0 auto',
        padding: theme.spacing(2),
        backgroundColor: theme.palette.primary.light,
    },
    sectionTitle: {
        padding: theme.spacing(2),
        backgroundColor: theme.palette.grey[300],
    },
}))
