import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()(() => ({
    table: {
        '& th': {
            fontWeight: 'bold',
        },
    },
}))
