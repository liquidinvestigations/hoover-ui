module.exports = {
    launch: {
        headless: process.env.CI === 'true',
    },
    browserContext: process.env.INCOGNITO ? 'incognito' : 'default',
    server: {
        command: `npm run start`,
        port: 8000,
        launchTimeout: 120000,
    },
}
