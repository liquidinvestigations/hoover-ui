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
