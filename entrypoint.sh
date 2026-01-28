#!/bin/sh
set -e

echo "========================================="
echo "Starting application initialization..."
echo "========================================="

# Decode and create YouTube cookies if provided
if [ -n "$YOUTUBE_COOKIES" ]; then
    echo "📝 Creating YouTube cookies file..."
    
    # Decode base64
    echo "$YOUTUBE_COOKIES" | base64 -d > /app/youtube-cookies.txt
    
    if [ -f /app/youtube-cookies.txt ]; then
        chmod 644 /app/youtube-cookies.txt
        
        FILE_SIZE=$(wc -c < /app/youtube-cookies.txt)
        LINE_COUNT=$(wc -l < /app/youtube-cookies.txt)
        FIRST_LINE=$(head -n 1 /app/youtube-cookies.txt)
        
        echo "✓ Cookies file created successfully"
        echo "  📊 File size: $FILE_SIZE bytes"
        echo "  📄 Line count: $LINE_COUNT"
        echo "  🔍 First line: $FIRST_LINE"
        
        # Validate it's a Netscape cookie file
        if echo "$FIRST_LINE" | grep -q "Netscape HTTP Cookie File"; then
            echo "  ✅ Valid Netscape cookie format detected"
        else
            echo "  ⚠️  WARNING: First line doesn't match Netscape format!"
            echo "  Expected: # Netscape HTTP Cookie File"
            echo "  Got: $FIRST_LINE"
        fi
        
        # Count actual cookie entries (lines starting with .)
        COOKIE_COUNT=$(grep -c "^\.youtube\.com" /app/youtube-cookies.txt || echo "0")
        echo "  🍪 Cookie entries found: $COOKIE_COUNT"
        
        if [ "$COOKIE_COUNT" -eq 0 ]; then
            echo "  ❌ ERROR: No YouTube cookie entries found!"
            echo "  Please verify your YOUTUBE_COOKIES secret is correctly base64 encoded"
        fi
    else
        echo "❌ Failed to create cookies file"
        exit 1
    fi
else
    echo "⚠️  WARNING: YOUTUBE_COOKIES environment variable not set"
    echo "   YouTube requests may be rate-limited or blocked"
fi

# Verify yt-dlp is available
if command -v yt-dlp >/dev/null 2>&1; then
    YT_DLP_VERSION=$(yt-dlp --version 2>/dev/null || echo "unknown")
    echo "✓ yt-dlp available (version: $YT_DLP_VERSION)"
else
    echo "❌ yt-dlp not found in PATH"
    exit 1
fi

# Check if server.js exists
if [ ! -f /app/server.js ]; then
    echo "❌ Error: server.js not found at /app/server.js"
    exit 1
fi

echo "========================================="
echo "✓ All checks passed!"
echo "🚀 Starting Node.js server..."
echo "========================================="

# Start the application
exec node server.js