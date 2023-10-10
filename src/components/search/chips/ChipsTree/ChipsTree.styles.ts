import { Theme } from '@mui/material'
import { red } from '@mui/material/colors'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    box: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginBottom: 0,
        },
    },
    chips: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        flexWrap: 'wrap',
    },
    operator: {
        display: 'block',
        fontSize: '10px',
        width: theme.spacing(1),
        textIndent: theme.spacing(1.5),
        marginLeft: theme.spacing(0.5),
        marginRight: theme.spacing(3.5),
        border: '1px solid black',
        borderLeft: 'none',
    },
    AND: {
        color: theme.palette.secondary.main,
        borderColor: theme.palette.secondary.main,
    },
    OR: {
        color: theme.palette.primary.main,
        borderColor: theme.palette.primary.main,
    },
    NOT: {
        color: red.A700,
        borderColor: red.A700,
    },
    notChip: {
        float: 'none',
    },
}))
