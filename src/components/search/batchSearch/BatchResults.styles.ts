import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme) => ({
    progress: {
        float: 'right',
    },
    results: {
        padding: 0,
        listStyle: 'none',
        marginTop: theme.spacing(1),
    },
    noHits: {
        '& a': {
            color: '#888',
        },
    },
    resultLink: {
        display: 'block',
        fontSize: '16px',
    },
    result: {
        width: '7em',
        fontSize: '80%',
        fontWeight: 'normal',
        textDecoration: 'none',
        display: 'inline-block',
        color: '#888',
    },
    error: {
        color: 'red',
    },
}))
