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

To run UI on localhost set environment variable `API_URL=https://hoover.your.server.url` and `REWRITE_API=true`
Also add `NODE_TLS_REJECT_UNAUTHORIZED=0` to allow local proxy without SSL.
You can set environment variables in your OS shell or as a part of the startup script in `package.json`

    "scripts": {
        ...
        "dev": "cross-env API_URL=https://hoover.your.server.url REWRITE_API=1 NODE_TLS_REJECT_UNAUTHORIZED=0 next dev -p 8000 -H 0.0.0.0",
        ...
    }

In order to get authorized just copy `_oauth2_proxy_hoover_your.server.url` cookie using browser's development tools
(`Application -> Cookies` in Chrome DevTools, `Data -> Cookies` in Firefox Firebug).

1. Login to `https://your.server.url` and go to `Hoover`
2. Open `Cookies` in development tools, find `_oauth2_proxy...` cookie under `https://your.server.url`, copy cookie name
3. Start your dev server, open development tools for it, go to `Cookies`, paste cookie name in `http://localhost:8000`
4. Copy & paste cookie value repeating steps 2-3

![image](https://user-images.githubusercontent.com/44607878/225839063-96e9b4e4-2ce4-42aa-a3c9-6ab613fb46d0.png)


#### Run npm using Docker

You can use the `npm.docker.sh` script instead of the binary `npm` on your
machine. This will run a docker image as your user and run `npm` on its
arguments.

Example usage: `./npm.docker.sh test -- -u`

#### Troubleshooting on M1 chip architecture

If you're running on a Mac with an M1 chip architecture and you encounter segfault errors while setting up the project, it may be due to an incompatibility issue with the node version you're using. Node.js versions prior to v16 may not have official support for M1 chip architecture, causing errors such as "qemu: uncaught target signal 11 (Segmentation fault) - core dumped".

To solve this problem, you can try upgrading to a version of Node.js that has official support for M1 chip architecture. As of writing, Node.js v16 is the first version to have official support, but it's always recommended to use the latest version available. You can download the latest version from the official Node.js website or by using Node Version Manager (NVM).


### Run the whole stack locally

You will need to meet the [hardware requirements](https://github.com/liquidinvestigations/docs/wiki/Hardware-requirements#storage) - have at least 16GB RAM free if you only want to run Hoover.
Run Liquid Investigations with [`mount_local_repos` = True](https://github.com/liquidinvestigations/node/blob/master/docs/Development.md). You can change the code in your local repository there.


## Node upgrade

Upgrading the node version requires a version bump in the following files:

-   package.json (`engine`)
-   .travis.yml
-   Dockerfile

## Icons

The project uses the following icon libraries:

- [MaterialUI Icons](https://material-ui.com/components/material-icons/)
- [Font Awesome](https://fontawesome.com/icons?d=gallery&p=2&s=solid&m=free) (free, solid)

Any additional library with icons in SVG format can be added, for example [Bootstrap Icons](https://icons.getbootstrap.com/)

## Environment variables

- **API_URL (required)** - URL of the backend server
- **REWRITE_API (boolean default unset)** - controls setting up proxy to backend API (for local development)
- **AGGREGATIONS_SPLIT (default 1)** - divider number for queuing concurrent requests to aggregations search API endpoint (1 - all requsts are concurrent, 2 - requests are divided into two concurrent packs running one after another, 3 - three packs, etc.)
- **MAX_SEARCH_RETRIES (default 1)** - number of search retries in synchronous search mode
- **SEARCH_RETRY_DELAY (default 3000)** - search retry delay in synchronous mode in milliseconds
- **ASYNC_SEARCH_POLL_INTERVAL (default 45)** - interval between search requests in asynchronous mode
- **ASYNC_SEARCH_MAX_FINAL_RETRIES (default 3)** - max numbers of requests retries when async search task is about to complete (ETA < pool interval)
- **ASYNC_SEARCH_ERROR_MULTIPLIER (default 2)** - async task initial ETA multiplier after which search request fails
- **ASYNC_SEARCH_ERROR_SUMMATION (default 60)** - async task initial ETA summation seconds after which search request fails
- **HOOVER_MAPS_ENABLED (boolean default unset)** - show maps link in top menu
- **HOOVER_TRANSLATION_ENABLED (boolean default unset)** - shows translation link in top menu
