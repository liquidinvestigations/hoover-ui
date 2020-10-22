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

Run Liquid Investigations with `mount_local_repos` = True.


## Node upgrade

Upgrading the node version requires a version bump in the following files:

-   package.json (`engine`)
-   .travis.yml
-   Dockerfile

