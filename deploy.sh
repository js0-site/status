#!/usr/bin/env bash

set -e
DIR=$(realpath $0) && DIR=${DIR%/*}
cd $DIR
set -a
. conf/deploy.env
set +a
set -x

ssh $VPS 'bash -c "
set -ex
cd /opt
clone(){
  local NAME=\$1
  if [ -d \$NAME ]; then
    cd \$NAME
    if ! git config --global --get-all safe.directory | grep -qx '/opt/status'; then
      git config --global --add safe.directory /opt/status
    fi
    git checkout dev && git fetch --all && git reset --hard origin/dev
    cd ..
  else
    git clone --depth=1 -b dev git@atomgit.com:js0/\$NAME.git
  fi
}

clone conf
clone status
cd status/conf
bun i
cd ..
bun i
chown -R status .
systemctl restart status
"'

# cp status.service /etc/systemd/system/
# systemctl daemon-reload
# systemctl enable status
