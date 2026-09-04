# Multi-stage build for Next.js 16 (standalone output, see next.config.mjs).
# Railway builds this directly (see railway.json) -- no docker-compose here,
# each PassVault app is its own Railway service.

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS builder
WORKDIR /app

# NEXT_PUBLIC_* vars are inlined into the client bundle at build time, so
# they must be ARGs (Railway auto-populates any ARG from a service variable
# of the same name -- see PassVaultpanel's Dockerfile for the same pattern
# with REACT_APP_*), not just runtime ENV on the final image.
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES
ENV NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
ENV NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES=${NEXT_PUBLIC_IDLE_TIMEOUT_MINUTES}

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Matches package.json's own build script -- Turbopack can't resolve
# Bootstrap's internal relative @import (see next.config.mjs's comment).
RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production

# Standalone output ships its own minimal server.js and only the node_modules
# it actually traced -- public/ and .next/static aren't included by default
# (see next.config.mjs output docs) and have to be copied in by hand.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Railway injects PORT at runtime; server.js reads it directly (see the
# next.config.mjs output docs' "Good to know" on PORT/HOSTNAME).
ENV HOSTNAME=0.0.0.0
EXPOSE 3000

CMD ["node", "server.js"]
