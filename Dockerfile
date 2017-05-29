FROM node:7

RUN mkdir -p /opt/hoover/ui
WORKDIR /opt/hoover/ui

ADD . /opt/hoover/ui/
