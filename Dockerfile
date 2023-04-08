# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory to /app
WORKDIR /app

# Install Node.js, npm, pnpm, and Python 3
RUN apt-get update
RUN apt-get install -y build-essential python3 libc6-dev python3-pip make gcc g++ node-gyp
RUN apt-get install -y libkrb5-dev libssl-dev libsasl2-dev 

# Copy the app source code to the container
COPY . .


ARG NEXT_PUBLIC_API_SITE_URL
ARG JWT_SECRET
ARG TEXTILE_HUB_KEY_DEV
ARG TEXTILE_HUB_SECRET_DEV
ARG TEXTILE_PK
ARG TEXTILE_THREADID
ARG TEXTILE_CLIENT_TOKEN
ARG NODE_VERSION
ARG TWITTER_CONSUMER_KEY
ARG TWITTER_CONSUMER_SECRET
ARG TWITTER_ACCESS_TOKEN_KEY
ARG TWITTER_ACCESS_TOKEN_SECRET
ARG TELEGRAM_TOKEN
ARG PINATA_API_KEY
ARG PINATA_API_SECRET
ARG DISCORD_BOT_TOKEN
ARG DISCORD_PUBLIC_KEY
ARG ABLY_ROOT_API_KEY
ARG ABLY_SUBSCRIBE_API_KEY
ARG SLACK_VERIFICATION_TOKEN
ARG REDIS_CONNECTION
ARG NFTSTORAGE_KEY
ARG PK_ORACLE
ARG CNVSEC_ID
ARG MONGODB_URI
ARG MONGODB_URI_OLD
ARG ETHERSCAN_API_KEY
ARG POLYGONSCAN_API_KEY
ARG CHAINSAFE_STORAGE_API_KEY
ARG OPTIMISMSCAN_API_KEY
ARG ALCHEMY_API_KEY
ARG ZAPPER_API_KEY

# Install app dependencies
RUN npm install -g pnpm
RUN npm install -g bson-ext --bson_parser=builtin
RUN pnpm install

# Build the Next.js app
RUN pnpm run build

# Expose port 3000 to the outside world
ENV PORT 3000
EXPOSE 3000

# Start the app server
CMD [ "pnpm", "start" ]
