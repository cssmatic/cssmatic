#!/bin/bash
set -e

git pull
pybabel compile -d translations
sudo service cssmatic-gunicorn restart
