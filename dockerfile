FROM node:20-alpine AS base

FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_OPTIONS="--max-old-space-size=400"

# Create user and group
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install system dependencies
RUN apk add --no-cache \
    python3 \
    ffmpeg \
    coreutils \
    curl \
    file

# Install yt-dlp
RUN curl -L https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o /usr/local/bin/yt-dlp && \
    chmod a+rx /usr/local/bin/yt-dlp && \
    ln -sf /usr/bin/python3 /usr/bin/python

# Create necessary directories with proper permissions
RUN mkdir -p .next temp && \
    chown -R nextjs:nodejs /app

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy specific node_modules for packages that need assets
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/natural ./node_modules/natural
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/stopwords-iso ./node_modules/stopwords-iso
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/natural/lib/natural/brill_pos_tagger/data ./node_modules/natural/lib/natural/brill_pos_tagger/data

# Copy and setup entrypoint
COPY --chown=nextjs:nodejs entrypoint.sh ./
RUN chmod +x entrypoint.sh

# Ensure nextjs user owns everything in /app
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["./entrypoint.sh"]