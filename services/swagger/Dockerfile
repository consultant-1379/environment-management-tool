# Create image based on the official Node 8.9.4-alpine image from the dockerhub
FROM armdocker.rnd.ericsson.se/dockerhub-ericsson-remote/node:8.9.4-alpine

# Create a directory where our app will be placed
RUN mkdir -p /usr/src/app

# Change directory so that our commands run inside this new directory
WORKDIR /usr/src/app

# Copy dependency definitions
COPY . /usr/src/app

# Install dependencies
RUN npm install
RUN npm install -g gulp@4.0.0
RUN npm install gulp@4.0.0
RUN gulp \
&& npm cache clean --force

# Expose the port the app runs in
EXPOSE 8181

# Serve the app
CMD ["npm", "start"]