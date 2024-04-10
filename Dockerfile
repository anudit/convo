FROM node:18 as base

WORKDIR /app

# Install node-gyp, Python 3
RUN apt-get update
RUN apt-get install -y build-essential python3 libc6-dev python3-pip make gcc g++ node-gyp
RUN apt-get install -y libkrb5-dev libssl-dev libsasl2-dev 

COPY . .

RUN npm install -g bun
RUN bun install

# Build the Next.js app
ENV NODE_ENV=production
RUN bun run build


FROM oven/bun:debian AS runner
WORKDIR /app

COPY --from=base /app .

ENV PORT 5004
EXPOSE 5004

# Start the app server
CMD [ "bun", "run", "start" ]