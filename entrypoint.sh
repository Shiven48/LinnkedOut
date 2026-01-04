#!/bin/sh
if [ -z "$YOUTUBE_COOKIES" ]; then
    echo "Warning: YOUTUBE_COOKIES is not set"
else
    printf "%b" "$YOUTUBE_COOKIES" > /app/youtube-cookies.txt
    echo "Cookies file generated."
fi

exec node server.js