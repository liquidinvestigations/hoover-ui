import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    docCount: {
        flex: '1 0 auto',
        paddingLeft: 6,
        alignSelf: 'flex-end',
        textAlign: 'right',
    },
}))
