const esModules = ['material-ui-nested-menu-item'].join('|')

module.exports = {
    transform: {
        '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
        '.+\\.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$': 'jest-transform-stub'
    },
    transformIgnorePatterns: [
        `/node_modules/(?!${esModules})`
    ],
    testPathIgnorePatterns: [
        '/.next/',
        '/node_modules/',
    ],
    setupFilesAfterEnv: [
        './__test__/setupTests.js'
    ],
    verbose: true,
}
