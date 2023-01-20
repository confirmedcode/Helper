#!/bin/bash

set -x

npm install -g n
n 16
npm install -g npm@8

# Install latest pm2
npm install pm2@latest -g
