module.exports = {
  projects: [
    {
      displayName: 'unit',
      transform: {
        '^.+\\.js$': "babel-jest",
        '.+\\.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$': 'jest-transform-stub'
      },
      testMatch: [
        '<rootDir>/__test__/__unit__/**/*.test.js',
      ]
    },
    {
      displayName: 'integration',
      preset: 'jest-puppeteer',
      transform: {
        '^.+\\.js$': "babel-jest",
        '.+\\.(css|styl|less|sass|scss|png|jpg|svg|ttf|woff|woff2)$': 'jest-transform-stub'
      },
      setupFiles: [
        '<rootDir>/__test__/__integration__/setupEnv.js',
      ],
      testMatch: [
        '<rootDir>/__test__/__integration__/**/*.test.js',
      ]
    }
  ]
}
