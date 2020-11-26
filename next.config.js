const withSass = require('@zeit/next-sass')
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin')

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
            source: '/doc/:collection/:id/raw/:file*',
            destination: '/api/v0/doc/:collection/:id/raw/:file*',
            permanent: true
        }],
    }
)
