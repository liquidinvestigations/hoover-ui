FROM node:14

RUN mkdir -p /opt/hoover/ui
WORKDIR /opt/hoover/ui

ADD package*.json /opt/hoover/ui/
RUN npm install && npm run build

ADD . /opt/hoover/ui/
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build
