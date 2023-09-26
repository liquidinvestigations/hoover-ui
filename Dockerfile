FROM node:18

# ARM64 does not have the chromium binary from NPM
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends chromium \
 && apt-get clean && rm -rf /var/lib/apt/lists/*

RUN mkdir -p /opt/hoover/ui
WORKDIR /opt/hoover/ui

ADD package*.json /opt/hoover/ui/
ADD postinstall-fixes.js /opt/hoover/ui/
RUN npm install --unsafe-perm

ADD . /opt/hoover/ui/
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run lint
RUN npm run build
