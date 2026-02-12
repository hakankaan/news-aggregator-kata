#!/bin/sh
set -e

# Generate runtime config with environment variables
# This injects secrets at container start, not build time
cat <<EOF > /usr/share/nginx/html/config.js
window.__ENV__ = {
  NEWSAPI_KEY: "${VITE_APP_NEWSAPI_KEY:-}",
  GNEWS_KEY: "${VITE_APP_GNEWS_KEY:-}",
  NYTIMES_KEY: "${VITE_APP_NYTIMES_KEY:-}",
  APP_URL: "${VITE_APP_APP_URL:-http://localhost:3000}"
};
EOF

# Start nginx
exec nginx -g "daemon off;"
