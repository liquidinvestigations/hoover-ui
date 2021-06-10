const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })
const { spawn } = require('child_process')
const kill  = require('tree-kill')
const puppeteer = require('puppeteer')
const { AfterAll, BeforeAll } = require('@cucumber/cucumber')
const { waitForMilliseconds } = require('../shared-objects/helpers')
const context = require('../shared-objects/context')

const options = {
    width: 1280,
    height: 1024,
}

BeforeAll({ timeout: 60 * 1000 }, async () => {
    context.server = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'start'], { stdio: 'inherit' })
    context.browser = await puppeteer.launch({
        headless: process.env.HEADLESS !== 'false',
        args: [`--window-size=${options.width},${options.height}`]
    })
    context.page = await context.browser.newPage()

    await context.page.setViewport({ width: options.width, height: options.height })
    await context.page.setCookie({
        name: process.env.OAUTH2_COOKIE_NAME,
        value: process.env.OAUTH2_COOKIE_VALUE,
        domain: 'localhost:8000',
    })
    await context.page.goto('http://localhost:8000', {
        waitUntil: 'networkidle2',
    })
})

AfterAll(async () => {
    if (process.env.HEADLESS === 'false') {
        await waitForMilliseconds( 3000)
    }
    kill(context.server.pid)
    context.browser.close()
})
