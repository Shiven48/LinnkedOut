#!/bin/sh
if [ -z "$YOUTUBE_COOKIES" ]; then
    echo "Warning: YOUTUBE_COOKIES variable is empty."
else
    # Use the /app/temp directory because it has the correct permissions
    printf "%s" "$YOUTUBE_COOKIES" > /app/temp/youtube-cookies.txt
    if [ $? -eq 0 ]; then
        echo "Cookies file successfully written to /app/temp/youtube-cookies.txt"
    else
        echo "FAILED to write cookies file."
    fi
fi

# Ensure HOSTNAME is set to 0.0.0.0 to fix EADDRNOTAVAIL
export HOSTNAME=0.0.0.0

exec node server.js