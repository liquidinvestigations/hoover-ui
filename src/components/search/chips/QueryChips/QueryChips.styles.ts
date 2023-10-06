import { Theme } from '@mui/material'
import { blue, red } from '@mui/material/colors'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    treeTitle: {
        fontWeight: '500',
        marginTop: theme.spacing(1),
    },

    chip: {
        backgroundColor: blue.A100,
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginBottom: 0,
        },
    },

    tooltipChip: {
        backgroundColor: blue.A200,
    },

    negationChip: {
        marginBottom: 0,
        cursor: 'pointer',
        backgroundColor: red.A200,
    },
}))
