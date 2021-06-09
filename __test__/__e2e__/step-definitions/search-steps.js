const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })
const { spawn } = require('child_process')
const kill  = require('tree-kill')
const puppeteer = require('puppeteer')
const { AfterAll, BeforeAll, When, Then } = require('@cucumber/cucumber')
const { assert } = require('chai')

let server, browser, page // TODO move to shared context file

const options = {
    width: 1280,
    height: 1024,
}

const waitForTransitionEnd = async element => {
    await page.evaluate(element => {
        return new Promise(resolve => {
            const onEnd = () => {
                element.removeEventListener('transitionend', onEnd)
                resolve()
            }
            element.addEventListener('transitionend', onEnd)
        })
    }, element)
}

const miliseconds = async ms => await new Promise(resolve => setTimeout(resolve, ms))

BeforeAll({timeout: 60 * 1000}, async () => {
    server = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['run', 'start'], { stdio: 'inherit' })
    browser = await puppeteer.launch({
        headless: process.env.HEADLESS !== 'false',
        args: [`--window-size=${options.width},${options.height}`]
    })
    page = await browser.newPage()

    await page.setViewport({ width: options.width, height: options.height })
    await page.setCookie({
        name: process.env.OAUTH2_COOKIE_NAME,
        value: process.env.OAUTH2_COOKIE_VALUE,
        domain: 'localhost:8000',
    })
    await page.goto('http://localhost:8000', {
        waitUntil: 'networkidle2',
    })
})

AfterAll(async () => {
    if (process.env.HEADLESS === 'false') {
        await miliseconds( 3000)
    }
    kill(server.pid)
    await browser.close()
})

const XPath = {
    categories: '//*[@data-test = "categories"]',
    filters: '//*[@data-test = "filters"]',
    searchInput: '//label[text() = "Search"]/following-sibling::*//textarea',
    searchButton: '//button[.//*[text() = "Search"]]',
    result: '//*[@data-test = "result"]',
}

When(/^I click (.*) category$/, async category => {
    const categoryXPath = `${XPath.categories}//*[text() = "${category}"]`
    await page.waitForXPath(categoryXPath)
    const [categoryElement] = await page.$x(categoryXPath)
    await categoryElement.click()

    const [filtersElement] = await page.$x(XPath.filters)
    await waitForTransitionEnd(filtersElement)

    await miliseconds( 1000) // wait for long lists to render
})

When(/^I click (.*) filter$/, async filter => {
    const filterXPath = `${XPath.filters}//*[contains(@class, "MuiButtonBase-root") and .//*[text() = "${filter}"]]`
    await page.waitForXPath(filterXPath)
    const [filterElement] = await page.$x(filterXPath)
    await filterElement.click()

    const collapseXPath = `${filterXPath}/preceding-sibling::*[contains(@class, "MuiCollapse-container")]`
    await page.waitForXPath(collapseXPath)
    const [collapseElement] = await page.$x(collapseXPath)
    await waitForTransitionEnd(collapseElement)
})

When(/^I click (.*) bucket$/, async bucket => {
    const bucketXPath = `${XPath.filters}//*[contains(@class, "MuiList-root")]//*[text() = "${bucket}"]`
    await page.waitForXPath(bucketXPath)
    const [bucketElement] = await page.$x(bucketXPath)
    await bucketElement.click()

    await page.waitForResponse(response => response.status() === 200)
})

When(/^I type (.*) in search box$/, async searchQuery => {
    const [searchBoxElement] = await page.$x(XPath.searchInput)
    await searchBoxElement.focus()
    await page.keyboard.type(searchQuery)
})

When(/^I click Search button$/, async () => {
    const [buttonElement] = await page.$x(XPath.searchButton)
    await buttonElement.click()

    await page.waitForResponse(response => response.status() === 200)
})

Then(/^I should see (\d+) results$/, async count => {
    await page.waitForXPath(XPath.result)
    const resultElements = await page.$x(XPath.result)

    assert.equal(resultElements.length, count)
})
