#!/bin/sh
set -e
node ./node_modules/prisma/build/index.js db push --skip-generate
node ./prisma/seed.js
# Ecoute sur toutes les interfaces, quel que soit le HOSTNAME impose par le moteur de conteneurs
export HOSTNAME=0.0.0.0
exec node server.js
