#!/bin/bash -ex

USERID="$(id -u $USERNAME)"
GROUPID="$(id -g $USERNAME)"

docker run -it  --rm --name hoover-ui-npm \
  -v "$(PWD)/:/app-mounted" \
  --user $USERID:$GROUPID \
  --volume "$PWD:$PWD" \
  --workdir "$PWD" \
  -p "8000:8000" \
  liquidinvestigations/hoover-ui:latest \
  npm $@
