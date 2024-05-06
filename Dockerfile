# Use the Ubuntu 22.04 slim image as the base image
FROM ubuntu:22.04 as builder

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV METEOR_ALLOW_SUPERUSER=true

# Install necessary dependencies
RUN apt-get update && apt-get install -y \
    curl \
    build-essential \
    python3 \
    python3-pip \
    git \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Install Volta
RUN curl https://get.volta.sh | bash

# Add Volta to PATH
ENV VOLTA_HOME="/root/.volta"
ENV PATH="$VOLTA_HOME/bin:$PATH"

# Install Node.js with Volta
RUN volta install node@14.21.3 yarn

# Install Meteor
RUN curl -sL https://install.meteor.com/?release=2.15 | sh

# Install Yarn globally using npm
#RUN npm install --global yarn

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock files to leverage Docker cache for dependency installation
COPY package.json yarn.lock ./

# Copy the entire application code
COPY . .

RUN export METEOR_ALLOW_SUPERUSER=true
# Install dependencies
RUN yarn

# Production image
FROM ubuntu:22.04 as production

# Set environment variables
ENV DEBIAN_FRONTEND=noninteractive
ENV METEOR_ALLOW_SUPERUSER=true
ENV VOLTA_HOME="/root/.volta"
ENV PATH="$VOLTA_HOME/bin:$PATH"
RUN echo $PATH
# Copy installed Volta, Node.js, and Yarn from the builder stage
#COPY --from=builder /root/.volta /root/.volta
#COPY --from=builder /usr/local/bin/node /usr/local/bin/node
#COPY --from=builder /usr/local/bin/npm /usr/local/bin/npm
#COPY --from=builder /usr/local/bin/yarn /usr/local/bin/yarn
# Copy installed Volta, Node.js, and Yarn from the builder stage
COPY --from=builder /root/.volta /root/.volta
# Copy application code and dependencies from the builder stage
WORKDIR /app
COPY --from=builder /app /app
RUN yarn
# Start the application (replace with the actual start command if different)
CMD ["yarn", "dsv"]
