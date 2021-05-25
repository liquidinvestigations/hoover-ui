import React from 'react'
import { render } from '@testing-library/react'
import theme from '../src/theme'
import { MuiPickersUtilsProvider } from '@material-ui/pickers'
import LuxonUtils from '@date-io/luxon'
import { CssBaseline } from '@material-ui/core'
import UserProvider from '../src/components/UserProvider'
import HashStateProvider from '../src/components/HashStateProvider'
import Layout from '../src/components/Layout'
import { ThemeProvider } from '@material-ui/core/styles'

const AppProviders = ({ children }) => (
    <ThemeProvider theme={theme}>
        <MuiPickersUtilsProvider utils={LuxonUtils}>
            <CssBaseline />
            <UserProvider whoAmI={{
                title: 'Test title',
                liquid: {
                    url: 'http://test.url',
                    title: 'Test liquid title',
                },
                urls: {
                    login: 'test login',
                },
            }}>
                <HashStateProvider>
                    <Layout>
                        {children}
                    </Layout>
                </HashStateProvider>
            </UserProvider>
        </MuiPickersUtilsProvider>
    </ThemeProvider>
)

jest.mock('next/router', () => require('next-router-mock'))

export const customRender = (ui, options = {}) =>
    render(ui, { wrapper: AppProviders, ...options })
