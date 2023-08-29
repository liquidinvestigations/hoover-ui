import { makeStyles } from "tss-react/mui";

export const useStyles = makeStyles()((theme) => ({
    input: {
        padding: theme.spacing(1),

        '&:focus': {
            outline: 'none',
        },

        '& fieldset': {
            border: 'none',
        },

        '& svg': {
            color: theme.palette.common.white,
        },

        '& input': {
            color: theme.palette.common.white,
        },

        '& .MuiInputBase-root': {
            width: '100%',
            '::before': {
                borderBottom: `1px solid ${theme.palette.common.white}`
            },

            '::after': {
                borderBottom: `1px solid ${theme.palette.common.white}`
            },

            ':hover:not(.Mui-disabled):before': {
                borderBottom: `1px solid ${theme.palette.common.white}`
            }
        },
    },
    searchCount: {
        color: theme.palette.common.white,
    }
}))