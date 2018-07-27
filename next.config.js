const withSass = require('@zeit/next-sass');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

module.exports = withSass({
    cssModules: false,
    exportPathMap: function(defaultPathMap) {
        return {
            '/': { page: '/index' },
            '/batch-search': { page: '/batch-search' },
            '/doc': { page: '/doc' },
            '/terms': { page: '/terms' },
        };
    },

    webpack(config, options) {
        config.plugins.push(new LodashModuleReplacementPlugin());

        return config;
    },
});
