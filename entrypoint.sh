#!/bin/sh
set -e

echo "Starting application initialization..."

# Decode and create YouTube cookies if provided
if [ -n "$YOUTUBE_COOKIES" ]; then
    echo "Creating YouTube cookies file..."
    echo "$YOUTUBE_COOKIES" | base64 -d > /app/youtube-cookies.txt
    
    if [ -f /app/youtube-cookies.txt ]; then
        chmod 644 /app/youtube-cookies.txt
        echo "✓ Cookies file created successfully"
        echo "  File size: $(wc -c < /app/youtube-cookies.txt) bytes"
        echo "  First line: $(head -n 1 /app/youtube-cookies.txt)"
    else
        echo "✗ Failed to create cookies file"
        exit 1
    fi
else
    echo "⚠ Warning: YOUTUBE_COOKIES environment variable not set"
    echo "  YouTube requests may be rate-limited or blocked"
fi

# Verify yt-dlp is available
if command -v yt-dlp >/dev/null 2>&1; then
    YT_DLP_VERSION=$(yt-dlp --version 2>/dev/null || echo "unknown")
    echo "✓ yt-dlp available (version: $YT_DLP_VERSION)"
else
    echo "✗ yt-dlp not found in PATH"
    exit 1
fi

# Check if server.js exists
if [ ! -f /app/server.js ]; then
    echo "✗ Error: server.js not found at /app/server.js"
    exit 1
fi

echo "✓ All checks passed, starting Node.js server..."
echo "----------------------------------------"

# Start the application
exec node server.js