Advanced UI for [Hoover](https://hoover.github.io)

## Installation

Working on the UI needs a recent nodejs (see 'engine' in package.json for the version currently used).

1.  Download the code, install dependencies

    ```shell
    git clone https://github.com/hoover/ui.git
    cd ui
    npm install
    ```

2.  Development server

    ```shell
    npm run dev
    ```

3.  Production server

    ```shell
    npm run prod
    ```

All servers listen on port 8000.


## Development

You can work on this repository by either using some already existing backend service (that you have a login for) or you can run the whole stack locally.


### Only run the UI code, use existing backend

To run UI on localhost set environment variable `API_URL=https://your.server.url` and `REWRITE_API=true`

In order to get authorized just copy OAuth2 proxy cookie.


### Run the whole stack locally

You will need to meet the [hardware requirements](https://github.com/liquidinvestigations/docs/wiki/Hardware-requirements#storage) - have at least 16GB RAM free if you only want to run Hoover.
Run Liquid Investigations with [`mount_local_repos` = True](https://github.com/liquidinvestigations/node/blob/master/docs/Development.md). You can change the code in your local repository there.


## Node upgrade

Upgrading the node version requires a version bump in the following files:

-   package.json (`engine`)
-   .travis.yml
-   Dockerfile

