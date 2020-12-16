const withSass = require('@zeit/next-sass')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

const { API_URL, REWRITE_API } = process.env

module.exports = withSass({
    cssModules: false,
    webpack(config, options) {
        config.plugins.push(new LodashModuleReplacementPlugin());
        config.module.rules.push({
            test: /\.(png|jpg|gif|svg)$/i,
            use: [
                {
                    loader: 'url-loader',
                    options: {
                        limit: 8192,
                    },
                },
            ],
        });

        return config;
    },
    distDir: 'build',
    poweredByHeader: false,
    // TODO on some sunny day, enable
    reactStrictMode: false,
    compress: false,
    redirects: () => [{
        source: '/doc/:collection/:id/raw/:filename',
        destination: '/api/v0/doc/:collection/:id/raw/:filename',
        permanent: true,
    }],
    rewrites: () => REWRITE_API ? [{
        source: '/api/v0/whoami',
        destination: API_URL + '/api/v0/whoami',
    },{
        source: '/api/v0/batch',
        destination: API_URL + '/api/v0/batch',
    },{
        source: '/api/v0/doc/:collection/:id/json',
        destination: API_URL + '/api/v0/doc/:collection/:id/json',
    },{
        source: '/api/v0/doc/:collection/:id/locations',
        destination: API_URL + '/api/v0/doc/:collection/:id/locations',
    },{
        source: '/api/v0/doc/:collection/:id/tags',
        destination: API_URL + '/api/v0/doc/:collection/:id/tags',
    },{
        source: '/api/v0/doc/:collection/:id/tags/:id',
        destination: API_URL + '/api/v0/doc/:collection/:id/tags/:id',
    },{
        source: '/api/v0/doc/:collection/:id/raw/:filename',
        destination: API_URL + '/api/v0/doc/:collection/:id/raw/:filename',
    },{
        source: '/api/v0/doc/:collection/:id/ocr/:tag',
        destination: API_URL + '/api/v0/doc/:collection/:id/ocr/:tag',
    }] : [],
})
