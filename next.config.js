const CopyWebpackPlugin = require('copy-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const {
    API_URL,

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
        API_URL,

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
}

module.exports = nextConfig
