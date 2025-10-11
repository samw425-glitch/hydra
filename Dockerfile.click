# 🐳 Hydra Click-Tracker Service
FROM node:18-alpine

# Create working directory
WORKDIR /app/click-tracker

# Copy only click-tracker service files
COPY ./click-tracker ./click-tracker
WORKDIR /app/click-tracker

# Install dependencies
RUN npm init -y && npm install express

# Expose port (Hydra expects 5050 by convention)
EXPOSE 5050

# Health check route runs index.js
CMD ["node", "index.js"]
