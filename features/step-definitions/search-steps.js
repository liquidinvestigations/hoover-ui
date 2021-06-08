const { Before, Given, When, Then } = require('puppeteer-cucumber-js')

Before(async () => {
    await helpers.loadPage('http://localhost:8000')
})

Given(/^In (.*) category and (.*) filter I (included|excluded) (.*) bucket$/, () => {

})

When(/^I search for (.*)$/, () => {

})

Then(/^I should see (\d+) results$/, () => {

})
