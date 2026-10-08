FROM node:24-alpine AS runner
WORKDIR /app

# Enable pnpm package manager
RUN corepack enable && corepack prepare pnpm@12.10.1 --activate

# Copy project manifests
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY web/package.json ./web/

# Install dependencies using frozen lockfile
RUN pnpm install --frozen-lockfile

# Copy application source code and prebuilt static site
COPY server/ ./server/
COPY site/ ./site/
COPY scripts/ ./scripts/
COPY supabase/ ./supabase/

ENV NODE_ENV=production
ENV PORT=8787
ENV HOST=0.0.0.0

EXPOSE 8787

CMD ["node", "scripts/start.js"]
