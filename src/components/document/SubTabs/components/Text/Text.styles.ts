import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()({
    preWrap: {
        whiteSpace: 'pre-wrap',

        '& mark.active': {
            backgroundColor: 'orange',
        },
    },
})
