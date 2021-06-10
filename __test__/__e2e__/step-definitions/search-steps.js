const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })
const { spawn } = require('child_process')
const kill  = require('tree-kill')
const { remote } = require('webdriverio')
const { AfterAll, BeforeAll, When, Then } = require('@cucumber/cucumber')
const { assert } = require('chai')

let server, browser // TODO move to shared context file

const options = {
    width: 1280,
    height: 1024,
}

const waitForBrowserReady = () => browser.waitUntil(() => browser.execute(() => document.readyState === 'complete'))
const waitForMilliseconds = ms => new Promise(resolve => setTimeout(resolve, ms))

BeforeAll({ timeout: 120 * 1000 }, async () => {
    server = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'dev'], { stdio: 'inherit' })
    browser = await remote({
        capabilities: {
            browserName: 'chrome',
            'goog:chromeOptions': {
                args: [...(process.env.HEADLESS !== 'false' ? ['--headless', '--disable-gpu'] : [])],
            }
        }
    })
    await browser.setWindowSize(options.width, options.height)
    await browser.setCookies({
        name: process.env.OAUTH2_COOKIE_NAME,
        value: process.env.OAUTH2_COOKIE_VALUE,
        domain: 'localhost:8000',
    })
    await browser.url('http://localhost:8000')

    // disable CSS transitions
    await browser.execute(() => {
        const styleElement = document.createElement('style')
        styleElement.setAttribute('id','style-tag')
        const styleTagCSSes = document.createTextNode('*,:after,:before{-webkit-transition:none!important;-moz-transition:none!important;-ms-transition:none!important;-o-transition:none!important;transition:none!important;-webkit-transform:none!important;-moz-transform:none!important;-ms-transform:none!important;-o-transform:none!important;transform:none!important}')
        styleElement.appendChild(styleTagCSSes)
        document.head.appendChild(styleElement)
    })
})

AfterAll(async () => {
    if (process.env.HEADLESS === 'false') {
        await waitForMilliseconds( 3000)
    }
    kill(server.pid)
    browser.closeWindow()
})

When(/^I click (.*) collection$/, { timeout: 10000 }, async collection => {
    const collections = await browser.react$('CollectionsFilter')
    const collectionComponent = await collections.react$('ListItemText', { props: { primary: collection } })

    await collectionComponent.click()
    await waitForBrowserReady()
})

When(/^I click (.*) category$/, async category => {
    const categoryDrawerComponent = await browser.react$('CategoryDrawer', { props: { label: category } })
    const categoryComponent = await categoryDrawerComponent.react$('ListItem')
    await categoryComponent.click()
})

When(/^I click (.*) filter$/, async filter => {
    const categoryDrawerComponent = await browser.react$('CategoryDrawer', { state: { open: true } })
    const filterComponent = await categoryDrawerComponent.react$('Expandable', { props: { title: filter } })
    await filterComponent.click()
})

When(/^I click (.*) bucket$/, async bucket => {
    const categoryDrawerComponent = await browser.react$('CategoryDrawer', { state: { open: true } })
    const bucketCmp = await categoryDrawerComponent.react$('ListItemText', { props: { primary: bucket } })
    await bucketCmp.click()
})

When(/^I type (.*) in search box$/, async searchQuery => {

})

When(/^I click Search button$/, async () => {

})

Then(/^I should see (\d+) results$/, async count => {

})
