# Use a lightweight NGINX image
FROM nginx:alpine

# Set working directory
WORKDIR /usr/share/nginx/html

# Copy web files
COPY index.html .
COPY css/ css/
COPY js/ js/

# Copy custom NGINX configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
