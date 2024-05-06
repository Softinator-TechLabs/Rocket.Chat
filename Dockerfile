# Use the Ubuntu 22.04 slim image as the base image
FROM ubuntu:22.04

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
RUN volta install node@14.21.3

# Install Meteor
RUN curl -sL https://install.meteor.com/?release=2.15 | sh

# Install Yarn globally using npm
RUN npm install --global yarn

# Set the working directory
WORKDIR /app

# Copy package.json and yarn.lock files to leverage Docker cache for dependency installation
COPY package.json yarn.lock ./


# Copy the entire application code
COPY . .

# Run the dsv script with Yarn
# Install dependencies
RUN yarn

# Start the application (replace with the actual start command if different)
CMD ["yarn", "dsv"]
