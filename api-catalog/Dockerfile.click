FROM node:18-alpine
WORKDIR /app
COPY click/package*.json ./
RUN npm ci --omit=dev
COPY click/ ./
EXPOSE 3000
CMD ["node", "server.js"]
