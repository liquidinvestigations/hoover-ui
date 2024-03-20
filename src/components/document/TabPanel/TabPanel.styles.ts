import { makeStyles } from 'tss-react/mui'

type StylesProps = { isHidden: boolean; padding: number }
export const useStyles = makeStyles<StylesProps>()((theme, { isHidden, padding }) => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        visibility: isHidden ? 'hidden' : 'visible',
        height: isHidden ? 0 : '100%',
        padding: isHidden ? 0 : theme.spacing(padding),
    },

    printTitle: {
        margin: theme.spacing(2),
    },
}))
