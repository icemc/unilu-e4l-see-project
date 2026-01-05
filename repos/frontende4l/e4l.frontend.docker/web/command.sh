#!/bin/bash
sed -i -e "s@PUBLIC_PATH@$PUBLIC_PATH@g" /usr/share/nginx/html/js/main.js
sed -i -e "s@PUBLIC_PATH@$PUBLIC_PATH@g" /usr/share/nginx/html/index.html
sed -i -e "s@API_URL@$API_URL@g" /usr/share/nginx/html/js/main.js
nginx -g 'daemon off;'
