# LinnkedOut Backend

Fetches YouTube transcripts using yt-dlp.

## Local

```bash
npm install
npm run dev
```

Requires `yt-dlp` installed: `brew install yt-dlp` or `pip install yt-dlp`

## Deploy

**Railway / Render / Fly.io** (supports yt-dlp binary):

```bash
railway up
# or
render deploy
# or
fly deploy
```

## API

**POST /transcripts**

```json
{ "videoIds": ["abc123", "def456"] }
```

Response:

```json
{ "transcripts": { "abc123": "text...", "def456": "" } }
```
