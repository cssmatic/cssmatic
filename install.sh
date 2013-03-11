#!/bin/bash
set -e

if [ $(whoami) != "cssmatic" ]; then
    echo "Run this script under the user cssmatic:"
    echo "$ useradd -d /home/cssmatic -m cssmatic"
    echo "$ usermod -s /bin/bash cssmatic"
    echo "$ adduser cssmatic sudo"
    echo "$ su - cssmatic"
    echo "$ mkdir /home/cssmatic/www && cd /home/cssmatic/www && git clone https://github.com/cssmatic/cssmatic.git"
    echo "$ cd cssmatic && ./install.sh"
    exit 1
fi

sudo apt-get install nginx

virtualenv --distribute $HOME/.virtualenvs/cssmatic
source $HOME/.virtualenvs/cssmatic/bin/activate
pip install -r requirements.txt
pybabel compile -d translations

# Install gunicorn configuration
sudo cp etc/init/cssmatic-gunicorn.conf /etc/init/
sudo initctl reload-configuration
service cssmatic-gunicorn start
if ! curl --silent --head http://localhost:8008/ | egrep "^HTTP/1.[01] 200 OK"; then
    echo "Error installing cssmatic flask process"
    exit 1
fi

# Install nginx configuration
sudo mkdir -p /opt/cache/cssmatic/proxy
sudo cp etc/nginx/sites-enabled/cssmatic-nginx.conf /etc/nginx/sites-enabled/
if ! nginx -t; then
    echo "Error in nginx configuration"
    exit 1
fi
sudo nginx -s reload
if ! curl --silent --head -H "Host: www.cssmatic.com" http://localhost/ | egrep "^HTTP/1.1 200 OK"; then
    echo "Error installing cssmatic nginx"
    exit 1
fi
