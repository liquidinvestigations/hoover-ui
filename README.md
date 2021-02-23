Advanced UI for [Hoover](https://hoover.github.io)

## Installation

Working on the UI needs a recent nodejs (see 'engine' in package.json for the version currently used).

1.  Download the code, install dependencies

    ```shell
    git clone https://github.com/liquidinvestigations/hoover-ui.git
    cd hoover-ui
    npm install
    ```

2.  Development server

    ```shell
    npm run dev
    ```

3.  Production server

    ```shell
    npm run build
    npm run prod
    ```

All servers listen on port 8000.


## Development

You can work on this repository by either using some already existing backend service (that you have a login for) or you can run the whole stack locally.


### Only run the UI code, use existing backend

To run UI on localhost set environment variable `API_URL=https://your.server.url` and `REWRITE_API=true`
Also add `NODE_TLS_REJECT_UNAUTHORIZED=0` to allow local proxy without SSL.
You can set environment variables in your OS shell or as a part of the startup script in `package.json`

    "scripts": {
        ...
        "dev": "cross-env API_URL=https://your.server.url REWRITE_API=1 NODE_TLS_REJECT_UNAUTHORIZED=0 next dev -p 8000 -H 0.0.0.0",
        ...
    }

In order to get authorized just copy `_oauth2_proxy_hoover_your.server.url` cookie using browser's development tools
(`Application -> Cookies` in Chrome DevTools, `Data -> Cookies` in Firefox Firebug).

1. Login to `https://your.server.url` and go to `Hoover`
2. Open `Cookies` in development tools, find `_oauth2_proxy...` cookie under `https://your.server.url`, copy cookie name
3. Start your dev server, open development tools for it, go to `Cookies`, paste cookie name in `http://localhost:8000`
4. Copy & paste cookie value repeating steps 2-3


### Run the whole stack locally

You will need to meet the [hardware requirements](https://github.com/liquidinvestigations/docs/wiki/Hardware-requirements#storage) - have at least 16GB RAM free if you only want to run Hoover.
Run Liquid Investigations with [`mount_local_repos` = True](https://github.com/liquidinvestigations/node/blob/master/docs/Development.md). You can change the code in your local repository there.


## Node upgrade

Upgrading the node version requires a version bump in the following files:

-   package.json (`engine`)
-   .travis.yml
-   Dockerfile

