const withSass = require('@zeit/next-sass');

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
});
