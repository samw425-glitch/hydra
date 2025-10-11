# Dockerfile.landing
FROM node:20-alpine

WORKDIR /app

# Copy landing template and public HTML
COPY ./template/ ./template/
COPY ../public/html/ ./public/html/

# Install optional dependencies (e.g., markdown-it)
RUN npm install markdown-it

# Serve static content
RUN npm install -g serve

EXPOSE 8080
CMD ["serve", "-s", "public/html", "-l", "8080"]

