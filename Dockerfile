FROM node:18
ARG BUILD_EXTRA_LIBS_ARM64

RUN mkdir -p /opt/hoover/ui
WORKDIR /opt/hoover/ui

RUN set -ex && if [ "$BUILD_EXTRA_LIBS_ARM64" ]; then \
  apt-get update -y  \
  && apt-get install -y \
    chromium libpangocairo-1.0-0 \
    build-essential libpixman-1-dev \
    libpixman-1-0 pkg-config \
    libcairo2-dev libpango1.0-dev \
    libjpeg-dev libgif-dev librsvg2-dev \
  && apt-get clean && rm -rf /var/lib/apt/lists/*;  \
fi

ADD package*.json ./
ADD postinstall-fixes.js ./
RUN npm --max-old-space-size=1000 install --unsafe-perm

ADD . /opt/hoover/ui/
RUN npm run build

ARG API_RETRY_DELAY_MIN
ARG API_RETRY_DELAY_MAX
ARG API_RETRY_COUNT

ARG ASYNC_SEARCH_POLL_SIZE
ARG ASYNC_SEARCH_POLL_INTERVAL
ARG ASYNC_SEARCH_ERROR_MULTIPLIER
ARG ASYNC_SEARCH_ERROR_SUMMATION

ARG HOOVER_MAPS_ENABLED
ARG HOOVER_TRANSLATION_ENABLED
ARG HOOVER_UPLOADS_ENABLED

RUN sed -i "s/{{API_RETRY_DELAY_MIN}}/${API_RETRY_DELAY_MIN}/g" /opt/hoover/ui/out/*.js
RUN sed -i "s/{{API_RETRY_DELAY_MAX}}/${API_RETRY_DELAY_MAX}/g" /opt/hoover/ui/out/*.js
RUN sed -i "s/{{API_RETRY_COUNT}}/${API_RETRY_COUNT}/g" /opt/hoover/ui/out/*.js

RUN sed -i "s/{{ASYNC_SEARCH_POLL_SIZE}}/${ASYNC_SEARCH_POLL_SIZE}/g" /opt/hoover/ui/out/*.js
RUN sed -i "s/{{ASYNC_SEARCH_POLL_INTERVAL}}/${ASYNC_SEARCH_POLL_INTERVAL}/g" /opt/hoover/ui/out/*.js
RUN sed -i "s/{{ASYNC_SEARCH_ERROR_MULTIPLIER}}/${ASYNC_SEARCH_ERROR_MULTIPLIER}/g" /opt/hoover/ui/out/*.js
RUN sed -i "s/{{ASYNC_SEARCH_ERROR_SUMMATION}}/${ASYNC_SEARCH_ERROR_SUMMATION}/g" /opt/hoover/ui/out/*.js

RUN sed -i "s/{{HOOVER_MAPS_ENABLED}}/${HOOVER_MAPS_ENABLED}/g" /opt/hoover/ui/out/*.js
RUN sed -i "s/{{HOOVER_TRANSLATION_ENABLED}}/${HOOVER_TRANSLATION_ENABLED}/g" /opt/hoover/ui/out/*.js
RUN sed -i "s/{{HOOVER_UPLOADS_ENABLED}}/${HOOVER_UPLOADS_ENABLED}/g" /opt/hoover/ui/out/*.js
