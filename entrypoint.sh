#!/bin/sh

if [ -n "$YOUTUBE_COOKIES" ]; then
    echo "$YOUTUBE_COOKIES" | base64 -d > /app/youtube-cookies.txt
    echo "Cookies file recreated from Base64."
else
    echo "Warning: YOUTUBE_COOKIES secret is missing."
fi

export HOSTNAME=0.0.0.0

exec node server.js