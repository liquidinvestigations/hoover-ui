const CopyWebpackPlugin = require('copy-webpack-plugin')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const withTM = require('next-transpile-modules')(['pdfjs-dist', 'screenfull'])

const {
    API_URL,
    REWRITE_API,
    AGGREGATIONS_SPLIT = 1,
    MAX_SEARCH_RETRIES = 1,
    SEARCH_RETRY_DELAY = 3000,
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
        AGGREGATIONS_SPLIT,
        MAX_SEARCH_RETRIES,
        SEARCH_RETRY_DELAY,
        ASYNC_SEARCH_POLL_INTERVAL,
        ASYNC_SEARCH_MAX_FINAL_RETRIES,
        ASYNC_SEARCH_ERROR_MULTIPLIER,
        ASYNC_SEARCH_ERROR_SUMMATION,
        HOOVER_MAPS_ENABLED,
        HOOVER_TRANSLATION_ENABLED,
        HOOVER_UPLOADS_ENABLED,
    },
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

module.exports = () => {
    const plugins = [withTM]
    return plugins.reduce((acc, plugin) => plugin(acc), { ...nextConfig })
}
