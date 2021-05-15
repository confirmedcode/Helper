#!/bin/bash

export NODE_ENV=production

set -x

cd /home/node/helper
env PATH=$PATH:/usr/local/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u node --hp /home/node
pm2 delete all
pm2 start index.js -i max --merge-logs --log ../logs/app.log

pm2 save
