const withSass = require('@zeit/next-css');
const withCss = require('@zeit/next-sass');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = withCss(
    withSass({
        cssModules: false,
        //exportPathMap: function(defaultPathMap) {
        //    return {
        //        '/': { page: '/index' },
        //        '/batch-search': { page: '/batch-search' },
        //        '/doc': { page: '/doc' },
        //        '/terms': { page: '/terms' },
        //    };
        //},

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
        rewrites: () => [
            { source: '/api/:path*', destination: 'https://hoover.fuze.xn--vj-qja.ro/api/:path*' }
        ]
    })
);
