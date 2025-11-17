#!/usr/bin/env bash

set -e
DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -x

exec watchexec \
  --shell=none \
  --project-origin . \
  -w . \
  --exts js \
  -r \
  -- bash -c 'oxfmt && oxlint && ./main.js'
