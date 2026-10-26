#!/bin/sh
set -eu

# Publish this build without deleting older fingerprinted assets from the shared
# Dokploy volume. Browsers on an earlier version can still download their files.
cp -R /opt/launchpad/dist/* /usr/share/nginx/html/

# Nginx runs as PID 1 and receives SIGQUIT for graceful connection draining.
exec nginx -g 'daemon off;'
