FROM node:18-bookworm-slim as base

WORKDIR /app

# Install node-gyp, Python 3
RUN apt-get update
RUN apt-get install -y build-essential python3 libc6-dev python3-pip make gcc g++ node-gyp libkrb5-dev libssl-dev libsasl2-dev

COPY package.json bun.lockb ./
RUN npm i -g bun
RUN bun install

# Build the Next.js app
COPY . .
ENV NODE_ENV=production
RUN bun run build

FROM oven/bun:distroless AS runner
WORKDIR /app

COPY --from=base /app .

ENV PORT 5004
EXPOSE 5004

# Start the app server
CMD [ "bun", "run", "start" ]
