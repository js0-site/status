#!/usr/bin/env bash

set -e
DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -x

cd src
exec watchexec \
  --shell=none \
  --project-origin . \
  -w . \
  --exts js \
  -r \
  -- sh -c 'oxfmt && oxlint && ./main.js'
