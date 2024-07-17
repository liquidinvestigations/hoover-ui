/* eslint-disable no-restricted-globals, no-console, @typescript-eslint/no-unsafe-call, @typescript-eslint/naming-convention  */
import { exec } from 'child_process'
import EventEmitter from 'events'
import fs from 'fs'
import http from 'http'
import path from 'path'

import express from 'express'
import { createProxyMiddleware } from 'http-proxy-middleware'
import minimist from 'minimist'
import morgan from 'morgan'
import open from 'open'
import webpack from 'webpack'
import webpackDevMiddleware from 'webpack-dev-middleware'
import webpackHmrMiddleware from 'webpack-hot-middleware'

import getWebpackConfig from './webpack.dev.js'

import type { RequestHandler } from 'express'

const httpProxyEndpoints = ['/api/geo/**', '/api/map/**', '/api/v1/**']

const setupProxyMiddleware =
    ({ app, devModeOrigin, verbose, ws = false }: { app: express.Express; devModeOrigin: string; verbose: boolean; ws?: boolean }) =>
    (urlPath: string) => {
        app.use(
            createProxyMiddleware(urlPath, {
                target: devModeOrigin,
                changeOrigin: true,
                ws,
                logLevel: verbose ? 'info' : 'silent',
                onError: (error) => {
                    console.error(error)
                },
                cookieDomainRewrite: 'localhost',
            }) as RequestHandler,
        )
    }

export const startDevServer = (): void => {
    /*
     * Cli examples
     *
     * Change port
     * pnpm start --port 8888
     *
     * Suppress browser open
     * pnpm start --no-open
     *
     * Enable express logging
     * pnpm start --verbose
     */

    const argv = minimist(process.argv) as { port?: number; open?: boolean; verbose?: boolean; origin?: string }

    const { port = 8080, open: performOpen = true, verbose = false } = argv

    const apiHost = process.env.API_URL
    const devModeOrigin = `${apiHost}`

    console.log(['Webpack is being run in development mode.', `All requests will proxy data from/to ORIGIN - '${devModeOrigin}'`].join('\n'))

    const app = express()

    const webpackConfig = getWebpackConfig() as webpack.Configuration

    const compiler = webpack(webpackConfig)

    if (verbose) {
        app.use(morgan('combined'))
    }

    httpProxyEndpoints.forEach(setupProxyMiddleware({ app, devModeOrigin, verbose }))

    // Squash built-in memory leak warning. Proxy middleware does bind to the same events, it's not a bug or a memory leak.
    EventEmitter.defaultMaxListeners = httpProxyEndpoints.length + 5

    const webpackMiddleware = webpackDevMiddleware(compiler, {
        writeToDisk: (name: string) => /^.*\.(html|htm)$/.test(name),
    })

    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    app.use(webpackMiddleware)

    app.use(webpackHmrMiddleware(compiler))

    app.get(`/*`, (_req, res) => {
        const htmlFile = fs.readFileSync(path.join(__dirname, `./dist/index.html`))
        res.set('Content-Type', 'text/html')
        res.send(htmlFile.toString())
    })

    http.createServer({}, app).listen(port, () => {
        const greenOutputColor = '\x1b[32m%s\x1b[0m'
        console.log(greenOutputColor, `Local address: http://localhost:${port}`)

        const command = "ifconfig | grep -Eo 'inet (addr:)?([0-9]*\\.){3}[0-9]*' | grep -Eo '([0-9]*\\.){3}[0-9]*' | grep -v '127.0.0.1'"
        exec(command, (_error, stdout) => {
            if (stdout) {
                const localIpAddresses = stdout
                    .split('\n')
                    .map((address) => address.trim())
                    .filter((address) => address !== '')
                localIpAddresses.forEach((address) => {
                    console.log(greenOutputColor, `Local network address: http://${address}:${port}`)
                })
            }
        })
    })

    // lets check if this is first compilation to not wait everytime
    if (performOpen) {
        if (fs.existsSync('dist/index.html')) {
            void open(`http://localhost:${port}/`)
        } else {
            webpackMiddleware.waitUntilValid(() => {
                void open(`http://localhost:${port}/`)
            })
        }
    }
}
