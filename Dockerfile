# Use the official Node.js 10 image.
# https://hub.docker.com/_/node
FROM node:18

# Create and change to the app directory.
WORKDIR /app

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json and yarn.lock are copied.
# Copying this separately prevents re-running yarn install on every code change.
COPY package*.json yarn.lock ./

# Install production dependencies.
RUN yarn install

# Copy local code to the container image.
COPY . .

RUN yarn build

EXPOSE 3000

# Run the web service on container startup.
CMD [ "yarn", "start" ]
