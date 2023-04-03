import { Theme } from '@mui/material'
import { blue, green, red } from '@mui/material/colors'
import { makeStyles } from 'tss-react/mui'

export const useStyles = makeStyles()((theme: Theme) => ({
    treeTitle: {
        marginTop: theme.spacing(1),
    },

    chip: {
        backgroundColor: green.A100,
        marginBottom: theme.spacing(1),

        '&:last-child': {
            marginBottom: 0,
        },
    },

    negationChip: {
        marginBottom: 0,
        cursor: 'pointer',
        backgroundColor: red.A100,
    },

    dateChip: {
        backgroundColor: blue[300],
    },

    dateBucketChip: {
        backgroundColor: blue[100],
    },
}))
