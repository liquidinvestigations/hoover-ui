const CopyWebpackPlugin = require('copy-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const {
    API_URL,
    REWRITE_API,
    API_RETRY_DELAY_MIN = 500,
    API_RETRY_DELAY_MAX = 10000,
    API_RETRY_COUNT = 4,

    SEARCH_RETRY_DELAY = 3000,
    MAX_SEARCH_RETRIES = 1,
    ASYNC_SEARCH_POLL_SIZE = 6,
    ASYNC_SEARCH_POLL_INTERVAL = 45,
    ASYNC_SEARCH_MAX_FINAL_RETRIES = 3,
    ASYNC_SEARCH_ERROR_MULTIPLIER = 2,
    ASYNC_SEARCH_ERROR_SUMMATION = 60,
    HOOVER_MAPS_ENABLED,
    HOOVER_TRANSLATION_ENABLED,
    HOOVER_UPLOADS_ENABLED,
} = process.env

/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        API_RETRY_DELAY_MIN,
        API_RETRY_DELAY_MAX,
        API_RETRY_COUNT,

        SEARCH_RETRY_DELAY,
        MAX_SEARCH_RETRIES,
        ASYNC_SEARCH_POLL_SIZE,
        ASYNC_SEARCH_POLL_INTERVAL,
        ASYNC_SEARCH_MAX_FINAL_RETRIES,
        ASYNC_SEARCH_ERROR_MULTIPLIER,
        ASYNC_SEARCH_ERROR_SUMMATION,
        HOOVER_MAPS_ENABLED,
        HOOVER_TRANSLATION_ENABLED,
        HOOVER_UPLOADS_ENABLED,
    },
    transpilePackages: ['pdfjs-dist', 'screenfull'],
    webpack(config) {
        config.plugins.push(
            new LodashModuleReplacementPlugin(),
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: './node_modules/pdfjs-dist/cmaps',
                        to: './static/cmaps',
                    },
                    {
                        from: './node_modules/pdfjs-dist/web/images/annotation-*',
                        to: './static/media/annotation/[name].[ext]',
                    },
                    {
                        from: './node_modules/pdfjs-dist/build/pdf.worker.js',
                        to: './static/pdf.worker.js',
                    },
                ],
            })
        )

        config.module.rules.push(
            {
                test: /\.svg$/,
                use: ['@svgr/webpack', 'url-loader'],
            },
            {
                test: /\.worker\.js$/,
                loader: 'worker-loader',
                options: {
                    filename: 'static/[name].js',
                },
            }
        )

        return config
    },
    distDir: 'build',
    poweredByHeader: false,
    productionBrowserSourceMaps: true,
    // TODO on some sunny day, enable
    reactStrictMode: false,
    compress: false,
    redirects: () => [
        {
            source: '/doc/:collection/:id/raw/:filename',
            destination: '/doc/:collection/:id',
            permanent: true,
        },
        {
            source: '/doc/:collection/:id/ocr/:tag',
            destination: '/doc/:collection/:id',
            permanent: true,
        },
    ],
    rewrites: () =>
        REWRITE_API
            ? [
                  {
                      source: '/api/geo',
                      destination: API_URL + '/api/geo',
                  },
                  {
                      source: '/api/map/:path*',
                      destination: API_URL + '/api/map/:path*',
                  },
                  {
                      source: '/api/v1/whoami',
                      destination: API_URL + '/api/v1/whoami',
                  },
                  {
                      source: '/api/v1/batch',
                      destination: API_URL + '/api/v1/batch',
                  },
                  {
                      source: '/api/v1/collections',
                      destination: API_URL + '/api/v1/collections',
                  },
                  {
                      source: '/api/v1/get_uploads',
                      destination: API_URL + '/api/v1/get_uploads',
                  },
                  {
                      source: '/api/v1/async_search/:uuid',
                      destination: API_URL + '/api/v1/async_search/:uuid',
                  },
                  {
                      source: '/api/v1/doc/:collection/:hash/json',
                      destination: API_URL + '/api/v1/doc/:collection/:hash/json',
                  },
                  {
                      source: '/api/v1/doc/:collection/:hash/locations',
                      destination: API_URL + '/api/v1/doc/:collection/:hash/locations',
                  },
                  {
                      source: '/api/v1/doc/:collection/:hash/tags',
                      destination: API_URL + '/api/v1/doc/:collection/:hash/tags',
                  },
                  {
                      source: '/api/v1/doc/:collection/:hash/tags/:id',
                      destination: API_URL + '/api/v1/doc/:collection/:hash/tags/:id',
                  },
                  {
                      source: '/api/v1/doc/:collection/:hash/raw/:filename',
                      destination: API_URL + '/api/v1/doc/:collection/:hash/raw/:filename',
                  },
                  {
                      source: '/api/v1/doc/:collection/:hash/pdf-preview',
                      destination: API_URL + '/api/v1/doc/:collection/:hash/pdf-preview',
                  },
                  {
                      source: '/api/v1/doc/:collection/:hash/ocr/:tag',
                      destination: API_URL + '/api/v1/doc/:collection/:hash/ocr/:tag',
                  },
                  {
                      source: '/api/v1/doc/:collection/:hash/thumbnail/:size(100|200|400).jpg',
                      destination: API_URL + '/api/v1/doc/:collection/:hash/thumbnail/:size.jpg',
                  },
                  {
                      source: '/api/v1/get_uploads',
                      destination: API_URL + '/api/v1/get_uploads',
                  },
                  {
                      source: '/api/v1/:collection/:directory/get_directory_uploads',
                      destination: API_URL + '/api/v1/:collection/:directory/get_directory_uploads',
                  },
                  {
                      source: '/api/v1/limits',
                      destination: API_URL + '/api/v1/limits',
                  },
                  {
                      source: '/api/v1/upload/',
                      destination: API_URL + '/api/v1/upload/',
                  },
              ]
            : [],
}

module.exports = () => [].reduce((acc, plugin) => plugin(acc), { ...nextConfig })


// Injected content via Sentry wizard below

const { withSentryConfig } = require("@sentry/nextjs");

module.exports = withSentryConfig(
  module.exports,
  {
    // For all available options, see:
    // https://github.com/getsentry/sentry-webpack-plugin#options

    // Suppresses source map uploading logs during build
    silent: true,

    // Auth token webpack do not work (error 401 when using auth token)
    // authToken: process.env.SENTRY_AUTH_TOKEN,

    org: "sentry",
    project: "hoover-ui",
  },
  {
    // For all available options, see:
    // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

    // Upload a larger set of source maps for prettier stack traces (increases build time)
    widenClientFileUpload: true,

    // Transpiles SDK to be compatible with IE11 (increases bundle size)
    transpileClientSDK: true,

    // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
    tunnelRoute: "/sentry-monitoring",

    // Hides source maps from generated client bundles
    hideSourceMaps: true,

    // Automatically tree-shake Sentry logger statements to reduce bundle size
    disableLogger: true,
  }
);
