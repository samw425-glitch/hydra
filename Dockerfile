# Base image
FROM node:18-alpine

# Working directory
WORKDIR /app

# Install Docker CLI and bash
RUN apk add --no-cache \
    bash \
    docker-cli \
    git \
    curl \
    libc6-compat

# Copy package.json and install dependencies
COPY api-catalog/package*.json ./
RUN npm ci --production

# Copy orchestrator script
COPY api-catalog/orchestrator.js ./orchestrator.js

# Copy templates and topics.csv
COPY templates /templates
COPY api-catalog/topics.csv ./topics.csv

# Expose API port
EXPOSE 3000

# Run orchestrator
CMD ["node", "orchestrator.js"]
