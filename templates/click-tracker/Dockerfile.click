# Dockerfile.click
FROM node:18-alpine

WORKDIR /app

# Copy and install dependencies
COPY package*.json ./
RUN npm ci --omit=dev || npm install --omit=dev

# Copy app code
COPY . .

# Expose click tracker API port
EXPOSE 4000

# Start the app
CMD ["node", "server.js"]
