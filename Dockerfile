FROM node:18

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN mkdir -p /opt/hoover/ui
WORKDIR /opt/hoover/ui

ADD package*.json /opt/hoover/ui/
ADD postinstall-fixes.js /opt/hoover/ui/
RUN npm install --unsafe-perm

ADD . /opt/hoover/ui/

RUN npm run build
