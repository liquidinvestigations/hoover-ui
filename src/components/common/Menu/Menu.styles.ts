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
        color: 'inherit',
        textDecoration: 'none',
    },
    languageMenu: {
        padding: `${theme.spacing(0.75)} ${theme.spacing(2)}`,

        p: {
            padding: 0,
        },
    },
}))
