#!/bin/sh
if [ -z "$YOUTUBE_COOKIES" ]; then
    echo "Warning: YOUTUBE_COOKIES variable is empty."
else
    # Use the /app/temp directory because it has the correct permissions
    printf "%s" "$YOUTUBE_COOKIES" > /app/youtube-cookies.txt
    if [ $? -eq 0 ]; then
        echo "Cookies file successfully written to /app/youtube-cookies.txt"
    else
        echo "FAILED to write cookies file."
    fi
fi

export HOSTNAME=0.0.0.0

exec node server.js