#!/bin/bash

mkdir -p logs
mkdir -p files

NODE_ENV=production npm start -- $* 2>&1 | tee -a logs/pakketti.log