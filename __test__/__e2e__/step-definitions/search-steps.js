const { When, Then } = require('@cucumber/cucumber')
const { assert } = require('chai')
const { waitForMilliseconds, waitForTransitionEnd } = require('../shared-objects/helpers')
const context = require('../shared-objects/context')

const XPath = {
    categories: '//*[@data-test = "categories"]',
    filters: '//*[@data-test = "filters"]',
    searchInput: '//label[text() = "Search"]/following-sibling::*//textarea',
    searchButton: '//button[.//*[text() = "Search"]]',
    result: '//*[@data-test = "result"]',
}

When(/^I click (.*) category$/, async category => {
    const categoryXPath = `${XPath.categories}//*[text() = "${category}"]`
    await context.page.waitForXPath(categoryXPath)
    const [categoryElement] = await context.page.$x(categoryXPath)
    await categoryElement.click()

    const [filtersElement] = await context.page.$x(XPath.filters)
    await waitForTransitionEnd(filtersElement)

    await waitForMilliseconds( 1000) // wait for long lists to render
})

When(/^I click (.*) filter$/, async filter => {
    const filterXPath = `${XPath.filters}//*[contains(@class, "MuiButtonBase-root") and .//*[text() = "${filter}"]]`
    await context.page.waitForXPath(filterXPath)
    const [filterElement] = await context.page.$x(filterXPath)
    await filterElement.click()

    const collapseXPath = `${filterXPath}/preceding-sibling::*[contains(@class, "MuiCollapse-container")]`
    await context.page.waitForXPath(collapseXPath)
    const [collapseElement] = await context.page.$x(collapseXPath)
    await waitForTransitionEnd(collapseElement)
})

When(/^I click (.*) bucket$/, async bucket => {
    const bucketXPath = `${XPath.filters}//*[contains(@class, "MuiList-root")]//*[text() = "${bucket}"]`
    await context.page.waitForXPath(bucketXPath)
    const [bucketElement] = await context.page.$x(bucketXPath)
    await bucketElement.click()

    await context.page.waitForResponse(response => response.status() === 200)
})

When(/^I type (.*) in search box$/, async searchQuery => {
    const [searchBoxElement] = await context.page.$x(XPath.searchInput)
    await searchBoxElement.focus()
    await context.page.keyboard.type(searchQuery)
})

When(/^I click Search button$/, async () => {
    const [buttonElement] = await context.page.$x(XPath.searchButton)
    await buttonElement.click()

    await context.page.waitForResponse(response => response.status() === 200)
})

Then(/^I should see (\d+) results$/, async count => {
    await context.page.waitForXPath(XPath.result)
    const resultElements = await context.page.$x(XPath.result)

    assert.equal(resultElements.length, count)
})
