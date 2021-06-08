describe('Search page', () => {
    beforeAll(async () => {
        jest.setTimeout(60000)
        await page.setCookie({
            name: process.env.OAUTH2_COOKIE_NAME,
            value: process.env.OAUTH2_COOKIE_VALUE,
            domain: 'localhost:8000',
        })
        await page.goto('http://localhost:8000/')
    })

    it('should load aggregations after collection select', async () => {
        const collectionXPath = '//span[text() = "testdata"]'
        const [testdataCollection] = await page.$x(collectionXPath)
        await testdataCollection.click()

        const docCountXPath = collectionXPath + '/parent::div/following-sibling::div/span[text()="479"]'
        await page.waitForXPath(docCountXPath)

        const [docCountElement] = await page.$x(docCountXPath)
        const docCountValue = await docCountElement.evaluate(el => el.textContent)

        expect(docCountValue).toEqual('479')

        it('should display content type aggregation buckets', async () => {
            const contentTypeXPath = '//div[text() = "File Types"]'
            const [contentTypeCategory] = await page.$x(contentTypeXPath)
            await contentTypeCategory.click()

            const textPlainXPath = '//span[text()="text/plain"]'
            await page.waitForXPath(textPlainXPath)

            const [textPlainBucket] = await page.$x(textPlainXPath)

        })
    })
})
