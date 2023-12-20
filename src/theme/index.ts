import { createTheme } from '@mui/material/styles'

import { customTypography as typography } from './typography'

const customTheme = createTheme({
    palette: {
        primary: {
            main: '#f5f5f5',
        },
        text: {
            primary: '#000',
        },
    },
    typography,
})

export default customTheme
