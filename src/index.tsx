import createCache from '@emotion/cache'
import { CacheProvider } from '@emotion/react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon'
import { deDE, esES, enUS, frFR, plPL, ptBR, zhCN } from '@mui/x-date-pickers/locales'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

import { DocPage } from './components/document/DocPage/DocPage'
import { Insights } from './components/insights/Insights'
import { Layout } from './components/Layout'
import { Maps } from './components/maps/Maps'
import { BatchSearch } from './components/search/batchSearch/BatchSearch/BatchSearch'
import { Search } from './components/search/Search'
import { SharedStoreProvider } from './components/SharedStoreProvider'
import { DirectoryUploads } from './components/uploads/DirectoryUploads/DirectoryUploads'
import { Uploads } from './components/uploads/Uploads'
import customTheme from './theme'
import { TolgeeNextProvider } from './tolgeeNext'

import '../styles/main.css'

const getLanguage = (): string => {
    let language = 'en'

    if (typeof window !== 'undefined') {
        language = localStorage.getItem('language') || language
    }

    return language
}

const getLocaleText = () => {
    switch (getLanguage()) {
        case 'de':
            return deDE.components.MuiLocalizationProvider.defaultProps.localeText

        case 'es':
            return esES.components.MuiLocalizationProvider.defaultProps.localeText

        case 'en':
            return enUS.components.MuiLocalizationProvider.defaultProps.localeText

        case 'fr':
            return frFR.components.MuiLocalizationProvider.defaultProps.localeText

        case 'pl':
            return plPL.components.MuiLocalizationProvider.defaultProps.localeText

        case 'pt':
            return ptBR.components.MuiLocalizationProvider.defaultProps.localeText

        case 'zh':
            return zhCN.components.MuiLocalizationProvider.defaultProps.localeText
    }
}

const mount = document.createElement('main')
mount.className = 'main'
document.body.append(mount)
const root = createRoot(mount)

const router = createBrowserRouter([
    {
        path: '/',
        element: <Layout />,
        //errorElement: <ErrorBoundary />,
        children: [
            {
                index: true,
                element: <Search />,
            },
            {
                path: '/doc/:collection/:id',
                element: <DocPage />,
            },
            {
                path: '/batch-search',
                element: <BatchSearch />,
            },
            {
                path: '/insights',
                element: <Insights />,
            },
            {
                path: '/maps',
                element: <Maps />,
            },
            {
                path: '/uploads',
                element: <Uploads />,
            },
            {
                path: '/upload/:collection/:id',
                element: <DirectoryUploads />,
            },
        ],
    },
])

root.render(
    <TolgeeNextProvider language={getLanguage()}>
        <CacheProvider value={createCache({ key: 'css', prepend: true })}>
            <LocalizationProvider dateAdapter={AdapterLuxon} localeText={getLocaleText()} adapterLocale={getLanguage()}>
                <ThemeProvider theme={customTheme}>
                    <CssBaseline />
                    <SharedStoreProvider>
                        <RouterProvider router={router} />
                    </SharedStoreProvider>
                </ThemeProvider>
            </LocalizationProvider>
        </CacheProvider>
    </TolgeeNextProvider>,
)
