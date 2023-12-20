import { Theme } from '@mui/material'
import { red, grey } from '@mui/material/colors'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    box: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'stretch',
        padding: theme.spacing(1),

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
        marginRight: theme.spacing(3.5),
        border: '1px solid black',
        borderLeft: 'none',
    },
    AND: {
        color: theme.palette.secondary.main,
        borderColor: theme.palette.secondary.main,

        '&.MuiBox-root': {
            border: '1px solid',
            borderRight: 'none',
            padding: theme.spacing(1),
        },
    },
    OR: {
        color: grey['500'],
        borderColor: grey['500'],

        '&.MuiBox-root': {
            border: '1px solid',
            borderRight: 'none',
            padding: theme.spacing(1),
        },
    },
    NOT: {
        color: red.A700,
        borderColor: red.A700,
    },
    notChip: {
        float: 'none',
    },
}))
