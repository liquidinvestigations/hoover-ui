FROM node:18

RUN mkdir -p /opt/hoover/ui
WORKDIR /opt/hoover/ui

ADD package*.json /opt/hoover/ui/
ADD patches /opt/hoover/ui/patches/
ADD postinstall-fixes.js /opt/hoover/ui/
RUN npm install --unsafe-perm

ADD . /opt/hoover/ui/
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build
