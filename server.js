const { parse } = require('url');
const next = require('next');
const express = require('express');
const proxy = require('http-proxy-middleware');

const dev = process.env.NODE_ENV !== 'production';
const port = +(process.env.PORT || 3000);
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
    const server = express();

    server.get('/doc/:collection/:id', (req, res) =>
        app.render(req, res, '/doc', req.params)
    );

    if (process.env.HOOVER_REMOTE_SEARCH_URL) {
        server.use(
            /^\/(whoami|collections|search|doc|limits|batch)/,
            proxy({
                target: process.env.HOOVER_REMOTE_SEARCH_URL,
                changeOrigin: true,
                logLevel: 'debug',
            })
        );
    }

    server.get('*', handle);

    server.listen(port, err => {
        if (err) {
            throw err;
        }

        console.log(`> hoover-ui development ready on http://localhost:${port}`);
    });
});
