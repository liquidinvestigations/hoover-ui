import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    menuHeader: {
        padding: `0 ${theme.spacing(2)}`,
    },
    menuItem: {
        color: 'black',
        textDecoration: 'none',
    },
    link: {
        color: 'white',
        textDecoration: 'none',
    },
}))
