FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY api-catalog/package*.json ./
RUN npm ci --production

# Copy orchestrator
COPY api-catalog/orchestrator.js ./orchestrator.js

# Copy templates (relative to build context root)
COPY templates /templates

# Copy topics.csv
COPY topics.csv ./topics.csv

EXPOSE 3000

CMD ["node", "orchestrator.js"]
