#!/bin/bash
set -ex
if [ $TARGETPLATFORM == linux/arm64* ]; then
  echo "INSTALLING PACKAGES FOR $TARGETPLATFORM"

  apt-get update -y

  apt-get install -y \
    chromium libpangocairo-1.0-0 \
    build-essential libpixman-1-dev \
    libpixman-1-0 pkg-config \
    libcairo2-dev libpango1.0-dev \
    libjpeg-dev libgif-dev librsvg2-dev

  apt-get clean && rm -rf /var/lib/apt/lists/*
else
  echo "NO PACKAGES TO INSTALL FOR $TARGETPLATFORM"
fi
