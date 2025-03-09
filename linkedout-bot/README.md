# Telegram Bot with Hono and Cloudflare Workers

This is a Telegram bot built with Hono.js and deployed on Cloudflare Workers using Bun.

## Prerequisites

- [Bun](https://bun.sh/) installed
- [Cloudflare account](https://dash.cloudflare.com/sign-up)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)
- A Telegram bot token (get it from [@BotFather](https://t.me/BotFather))

## Setup

1. Clone this repository
2. Install dependencies:
   ```
   bun install
   ```
3. Configure your Telegram bot token:
   - Edit `wrangler.toml` and add your Telegram bot token to the `TELEGRAM_BOT_TOKEN` variable.
   - Alternatively, you can use Cloudflare's secret management:
     ```
     wrangler secret put TELEGRAM_BOT_TOKEN
     ```

## Development

To run the bot locally:

```
bun run dev
```

This will start a local development server. You'll need to use a tool like ngrok to expose your local server to the internet to test with Telegram.

## Deployment

To deploy the bot to Cloudflare Workers:

```
bun run deploy
```

After deployment, you need to set the webhook URL for your Telegram bot:

```
curl https://your-worker-url.workers.dev/setWebhook?url=https://your-worker-url.workers.dev/webhook
```

Or visit `https://your-worker-url.workers.dev/setWebhook?url=https://your-worker-url.workers.dev/webhook` in your browser.

## Bot Commands

- `/start` - Starts the bot and displays a welcome message
- Any other message will be echoed back to you

## Customization

To add more functionality to your bot, edit the webhook handler in `src/index.ts`. You can process different types of messages and add more commands based on the Telegram Bot API.
