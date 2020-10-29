import { createMuiTheme, createGenerateClassName } from '@material-ui/core/styles';
// import purple from '@material-ui/core/colors/purple';
// import green from '@material-ui/core/colors/green';

// A theme with custom primary and secondary color.
// It's optional.
const theme = createMuiTheme({
    palette: {
        // primary: {
        // },
        // secondary: {
        // },
    },
    typography: {
        fontFamily: "'Open Sans', sans-serif",
        fontFamilyMono:
            'SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    },
});

function createPageContext() {
    return {
        theme,
        // The standard class name generator.
        generateClassName: createGenerateClassName(),
    };
}

export default function getPageContext() {
    // Make sure to create a new context for every server-side request so that data
    // isn't shared between connections (which would be bad).
    if (!process.browser) {
        return createPageContext();
    }

    // Reuse context on the client-side.
    if (!global.__INIT_MATERIAL_UI__) {
        global.__INIT_MATERIAL_UI__ = createPageContext();
    }

    return global.__INIT_MATERIAL_UI__;
}
