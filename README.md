Advanced UI for [Hoover](https://hoover.github.io)

## Installation
The UI needs a recent nodejs 5 or newer.

1. Download the code, install dependencies

    ```shell
    git clone https://github.com/hoover/ui.git
    cd ui
    npm install
    ```

2. Build the app

    ```shell
    ./run build
    ```

## Deployment
The UI is just a bunch of static files, they are generated in the `build`
folder. They consume the API of
[Hoover-Search](https://github.com/hoover/search). It can serve these files
from disk if you set `HOOVER_UI_ROOT` in `hoover/site/settings/local.py` to the
path of the UI's `build` folder.
