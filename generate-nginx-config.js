#!/usr/bin/env node
"use strict";

// stolen from https://github.com/geops/next-nginx-routes/blob/9bfa4adee3baed3a299207b142b6c88b6b7f70b7/generate.js#L1C1-L24C80

const { cwd } = require("process");
const { readFileSync, writeFileSync } = require("fs");

const routesManifest = "./build/routes-manifest.json";
const manifest = JSON.parse(readFileSync(routesManifest, "utf8"));

const routes = manifest.staticRoutes
  .concat(manifest.dynamicRoutes)
  .map((route) => {
    if (route.page === "/") {
      route.page = "/index";
    }
    return `
location ~ ${route.regex} {
    try_files ${route.page}.html /index.html;
}`;
  });

writeFileSync("./out/nginx-routes.conf", routes.join("\n"));

console.log(`Nginx routes configuration written to ./out/nginx-routes.conf`);
