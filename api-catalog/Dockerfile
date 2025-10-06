FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY orchestrator.js ./
EXPOSE 3000
CMD ["node", "orchestrator.js"]
