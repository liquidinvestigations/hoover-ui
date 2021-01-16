import { createMuiTheme } from '@material-ui/core/styles'

// Create a theme instance.
const theme = createMuiTheme({
    "palette": {
       "common": {
          "black":"#000",
          "white":"#fff"
       },
       "background": {
          "paper":"#fff",
          "default":"#fafafa"
       },
       "primary": {
          "light":"rgba(71, 145, 219, 1)",
          "main":"rgba(25, 118, 210, 1)",
          "dark":"rgba(17, 82, 147, 1)",
          "contrastText":"#fff"
       },
       "secondary": {
          "light":"rgba(115, 87, 185, 1)",
          "main":"rgba(81, 45, 168, 1)",
          "dark":"rgba(56, 31, 117, 1)",
          "contrastText":"#fff"
       },
       "error": {
          "light":"#e57373",
          "main":"#f44336",
          "dark":"#d32f2f",
          "contrastText":"#fff"
       },
       "text": {
          "primary":"rgba(0, 0, 0, 0.87)",
          "secondary":"rgba(0, 0, 0, 0.54)",
          "disabled":"rgba(0, 0, 0, 0.38)",
          "hint":"rgba(0, 0, 0, 0.38)"
       }
    },
    typography: {
        fontFamily: "'Open Sans', sans-serif",
        fontFamilyMono:
            'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
})

export default theme
