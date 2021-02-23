const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const withTM = require('next-transpile-modules')(['pdfjs-dist'])
const withPlugins = require('next-compose-plugins')

const { API_URL, REWRITE_API } = process.env

module.exports = withPlugins([ withTM ],
    {
        cssModules: false,
        webpack(config, options) {
            config.plugins.push(
                new LodashModuleReplacementPlugin(),
                new CopyWebpackPlugin({
                    patterns: [
                        {
                            from: './node_modules/pdfjs-dist/cmaps',
                            to: './static/cmaps',
                        },
                    ],
                }),
            );

            config.module.rules.push({
                test: /\.(png|jpg|gif)$/i,
                loader: 'url-loader',
                options: {
                    limit: 8192,
                },
            },{
                test: /\.svg$/,
                use: ['@svgr/webpack', 'url-loader'],
            },{
                test: /\.worker\.js$/,
                loader: 'worker-loader',
                options: {
                    filename: 'static/[name].js',
                },
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
            source: '/api/v0/doc/:collection/:hash/json',
            destination: API_URL + '/api/v0/doc/:collection/:hash/json',
        },{
            source: '/api/v0/doc/:collection/:hash/locations',
            destination: API_URL + '/api/v0/doc/:collection/:hash/locations',
        },{
            source: '/api/v0/doc/:collection/:hash/tags',
            destination: API_URL + '/api/v0/doc/:collection/:hash/tags',
        },{
            source: '/api/v0/doc/:collection/:hash/tags/:id',
            destination: API_URL + '/api/v0/doc/:collection/:hash/tags/:id',
        },{
            source: '/api/v0/doc/:collection/:hash/raw/:filename',
            destination: API_URL + '/api/v0/doc/:collection/:hash/raw/:filename',
        },{
            source: '/api/v0/doc/:collection/:hash/ocr/:tag',
            destination: API_URL + '/api/v0/doc/:collection/:hash/ocr/:tag',
        }] : [],
    }
)
