#!/bin/bash
set -e

if [ $(whoami) != "cssmatic" ]; then
    echo "Run this script under the user cssmatic:"
    echo "$ useradd -d /home/cssmatic -m cssmatic"
fi

apt-get install nginx

virtualenv --distribute $HOME/.virtualenvs/cssmatic
source $HOME/.virtualenvs/cssmatic/bin/activate
pip install -r requirements.txt

sudo mkdir -p /opt/cache/cssmatic/proxy
sudo ln -s `pwd`/etc/init/gunicorn.conf /etc/init/
sudo initctl reload-configuration
if ! curl --silent --head http://localhost:5000/ | egrep "^HTTP/1.0 200 OK"; then
    echo "Error installing cssmatic flask process"
    exit 0
fi

sudo ln -s `pwd`/etc/cssmatic-nginx.conf /etc/nginx/sites-enabled/
if ! nginx -t; then
    echo "Error in nginx configuration"
    exit 0
fi

sudo nginx -s reload
if ! curl --silent --head -H "Host: www.cssmatic.com" http://localhost/ | egrep "^HTTP/1.0 200 OK"; then
    echo "Error installing cssmatic nginx"
    exit 0
fi
