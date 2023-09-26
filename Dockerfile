FROM node:18
ARG TARGETPLATFORM
ENV TARGETPLATFORM=$TARGETPLATFORM

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN mkdir -p /opt/hoover/ui
WORKDIR /opt/hoover/ui

ADD .dockerfile-add-extra-packages.sh ./
RUN bash .dockerfile-add-extra-packages.sh

ADD package*.json ./
ADD postinstall-fixes.js ./
RUN npm --max-old-space-size=1000 install --unsafe-perm --omit=dev

ADD . /opt/hoover/ui/

RUN npm run build
